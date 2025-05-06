import axios from "axios";
import { textMessage } from '../../utll/requestBuilder.js';
import agendaReuniao from "../operacoes/agendaReuniao.js";
import estruturaMensagemTexto from "../operacoes/estruturaMensagemTexto.js";
import cancelaReuniao from "../operacoes/cancelaReuniao.js";

const mensagemTexto = async (consulta, numeroTel, mensagem, res) => {
    if (consulta.etapaFluxo === 'INICIAL') {
        const resposta = await estruturaMensagemTexto(mensagem);
        if (typeof resposta === "object" && resposta !== null) {
            if (resposta.indCancelamento) {
                console.log("Usuário deseja cancelar a reunião.");
                await cancelaReuniao(consulta, numeroTel, resposta);
                return;
            }

            const respostaString = JSON.stringify(resposta);
            try {
                await agendaReuniao(consulta, resposta, res);
                // await axios(textMessage(numeroTel, respostaString));
            } catch (err) {
                console.log(err);
                res.status(400).json({ error: 'Error sending message' + err });
            }
        } else {
            await axios(textMessage(numeroTel, resposta));
            res.status(200).json({ message: 'Message sent successfully' });
        }
    } else {
        if (mensagem.toUpperCase() === 'CANCELAR') {
            consulta.etapaFluxo = 'INICIAL';
            consulta.reuniao = null;
            await consulta.save();
            await axios(textMessage(numeroTel, 'Reunião cancelada.'));
            res.status(200).json({ message: 'Fluxo cancelado' });
            return;
        } else {
            await axios(textMessage(numeroTel, 'Você está com uma reunião aguardando finalização de agendamento. Por favor, finalize o agendamento ou cancele aa reunião atual enviando a mensagem "Cancelar".'));
            res.status(400).json({ error: 'Você não está no fluxo correto.' });
        }
    }
}

export default mensagemTexto;
