import Reuniao from '../../model/reuniao.js';
import Participantes from '../../model/participantes.js';
import Pessoa from '../../model/pessoa.js';
import Telefone from '../../model/telefone.js';
import { textMessage } from '../../utll/requestBuilder.js';
import axios from 'axios';
import mongoose from 'mongoose';

const agendaReuniao = async (consulta, objReuniao, res) => {
    console.log(objReuniao)
    objReuniao.organizador = consulta[0]._id;
    const novaReuniao = await Reuniao.create(objReuniao);
    const participantes = objReuniao.participantes;

    try {
        for (let i = 0; i < participantes.length; i++) {
            let participante = await Pessoa.find({ nome: participantes[i] });
            if (participante.length === 1) {
                const telefone = await Telefone.findOne({ pessoa: participante[0]._id });

                if (!telefone) {
                    console.log('Telefone não encontrado para a pessoa:', participante[0]._id);
                    return;
                }

                if (!novaReuniao || !novaReuniao._id) {
                    console.log('Erro: novaReuniao não encontrada ou sem _id');
                    return;
                }

                const participanteId = new mongoose.Types.ObjectId(participante[0]._id);
                const reuniaoId = new mongoose.Types.ObjectId(novaReuniao._id);

                const novoParticipante = {
                    pessoa: participanteId,
                    reuniao: reuniaoId,
                    conviteAceito: true
                }


                const participateDoc = new Participantes(novoParticipante);
                await participateDoc.save();
                const mensagem = `Olá ${participante[0].nome}, você foi convidado para a reunião ${novaReuniao.titulo} no dia ${novaReuniao.dataHoraInicio}.`;
                console.log('Enviando mensagem para:', telefone.numero);
                await axios(textMessage(telefone.numero, mensagem));
            } else if (participante.length > 1) {
                // Enviar lista de pessoas com o mesmo nome para o usuário escolher
            } else {
                // Enviar mensagem para o usuário informando que não foi encontrado
            }
        }

        return res.status(200).json({ message: 'Reunião agendada com sucesso!' });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error });
    }
}

export default agendaReuniao;