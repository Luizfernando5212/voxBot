import Reuniao from '../../model/reuniao.js';
import Participantes from '../../model/participantes.js';
import Pessoa from '../../model/pessoa.js';
import Telefone from '../../model/telefone.js';
import { textMessage } from '../../utll/requestBuilder.js';
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

/**
 * 
 * @param {Object} consulta - Objeto de consulta de pessoa retornado do banco de dados
 * @param {Object} objReuniao - Objeto de reunião estruturado
 * @param {Object} res 
 * @returns 
 */
const agendaReuniao = async (consulta, objReuniao, res) => {
    objReuniao.organizador = consulta[0].pessoa._id;
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
            participantes.forEach(async (participante) => {
                let participanteDoc = await Pessoa.find({ nome: { $regex: `^${participante}`, $options: 'i' } });
                if (participanteDoc.length === 1) {
                    await adicionaParticipante(participanteDoc[0], novaReuniao);
                } else if (participanteDoc.length > 1) {
                    // Enviar lista de pessoas com o mesmo nome para o usuário escolher
                } else {
                    // Enviar mensagem para o usuário informando que não foi encontrado
                }
            });
            await adicionaParticipante(consulta[0].pessoa, novaReuniao);
        }

        return res.status(200).json({ message: 'Reunião agendada com sucesso!' });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error });
    }
}

export default agendaReuniao;
