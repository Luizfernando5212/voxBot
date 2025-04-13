import Reuniao from '../../model/reuniao.js';
import Participantes from '../../model/participantes.js';
import Pessoa from '../../model/pessoa.js';
import Telefone from '../../model/telefone.js';
import { textMessage, interactiveListMessage } from '../../utll/requestBuilder.js';
import axios from 'axios';
import mongoose from 'mongoose';

const adicionaParticipante = async (participante, reuniao) => {
    const telefone = await Telefone.findOne({ pessoa: participante._id });
    if (!telefone) {
        console.log('Telefone não encontrado para a pessoa:', participante._id);
        return;
    }
    if (!reuniao || !reuniao._id) {
        console.log('Erro: reuniao não encontrada ou sem _id');
        return;
    }
    const participanteId = new mongoose.Types.ObjectId(participante._id);
    const reuniaoId = new mongoose.Types.ObjectId(reuniao._id);
    const novoParticipante = {
        pessoa: participanteId,
        reuniao: reuniaoId,
        conviteAceito: true
    }
    const participanteDoc = new Participantes(novoParticipante);
    await participanteDoc.save();

    const mensagem = `Olá ${participante.nome}, você foi convidado para a reunião ${reuniao.titulo} no dia ${reuniao.dataHoraInicio}.`;
    if (reuniao.organizador !== participante._id) {
        await axios(textMessage(telefone.numero, mensagem));
    }
}

const findWithJoinCascade = async ({
    model,
    joins = [],
    conditions = [],
    project = null
  }) => {
    const pipeline = [];
  
    // Add lookups
    joins.forEach(({ from, localField, foreignField = '_id', as }) => {
      pipeline.push({
        $lookup: {
          from,
          localField,
          foreignField,
          as
        }
      });
      pipeline.push({ $unwind: `$${as}` });
    });
  
    // Add filters (AND conditions)
    if (conditions.length > 0) {
      pipeline.push({
        $match: {
          $and: conditions
        }
      });
    }

    if (project) {
        pipeline.push({ $project: project });
      }
  
    return await model.aggregate(pipeline);
  };
  

/**
 * 
 * @param {Object} consulta - Objeto de consulta de pessoa retornado do banco de dados
 * @param {Object} objReuniao - Objeto de reunião estruturado
 * @param {Object} res 
 * @returns 
 */
const agendaReuniao = async (consulta, objReuniao, res) => {
    objReuniao.organizador = consulta.pessoa._id;
    const novaReuniao = await Reuniao.create(objReuniao);
    let participantes = objReuniao.participantes;
    const setor = objReuniao.setor;

    try {
        if (participantes.length === 0 && setor !== null) {
            participantes = await Pessoa.find({ setor: setor });
            if (participantes.length === 0) {
                console.log('Nenhum participante encontrado para o setor:', setor);
                return;
            }
            participantes.forEach(async (participante) => {
                await adicionaParticipante(participante, novaReuniao);
            });
        } else {
            let naoEncontrados = [];
            let qtdDuplicados = 0;
            for (const participante of participantes) {
                let participanteDoc = await findWithJoinCascade({
                    model: Pessoa,
                    joins: [
                        { from: 'setors', localField: 'setor', as: 'setor' },
                        { from: 'empresas', localField: 'setor.empresa', as: 'empresa' },
                    ],
                    conditions: [
                        { nome: { $regex: `${participante}`, $options: 'i' } },
                        { 'empresa._id': consulta.pessoa.setor.empresa._id }
                    ],
                    project: { _id: 1, nome: 1, 'setor.descricao': 1 }
                });
                if (participanteDoc.length === 1) {
                    await adicionaParticipante(participanteDoc[0], novaReuniao);
                } else if (participanteDoc.length > 1) {
                    // Enviar lista de pessoas com o mesmo nome para o usuário escolher
                    let listaParticipantes = participanteDoc.map(p => ({
                    nome: `${p.nome} - ${p.setor.descricao}`,
                    id: p._id
                }));
                    let mensagem = `Encontramos mais de uma pessoa com o nome ${participante}. Por favor, escolha uma das opções`; 
                    await axios(interactiveListMessage(consulta.numero, mensagem, listaParticipantes,'Pessoas'));
                    qtdDuplicados++;
                } else {
                    // Participante não encontrado, nesse caso mandar mensagem para o usuário
                    naoEncontrados.push(participante);
                }
            };
            if (naoEncontrados.length > 0) {
                let mensagemNaoEncontrados = `As seguintes pessoas não foram encontradas: ${naoEncontrados.join(', ')}.`;
                await axios(textMessage(consulta.numero, mensagemNaoEncontrados));
                await axios(textMessage(consulta.numero, 'Verifique o(s) nome(s) ou consulte o administrador e tente novamente.'));
            } else if (qtdDuplicados > 0) {
                // Atualizar qtdDuplicados na reunião
                novaReuniao.qtdDuplicados = qtdDuplicados;
                await novaReuniao.save();
            }
            // await adicionaParticipante(consulta.pessoa, novaReuniao);
        }

        return res.status(200).json({ message: 'Reunião agendada com sucesso!' });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error });
    }
}

export default agendaReuniao;
