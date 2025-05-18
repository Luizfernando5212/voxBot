import axios from "axios";
import { textMessage } from '../../utll/requestBuilder.js';
import agendaReuniao from "../operacoes/agendaReuniao.js";
import estruturaMensagemTexto from "../operacoes/estruturaMensagemTexto.js";
import cancelaReuniao from "../operacoes/cancelaReuniao.js";
import alteraHorarioReuniao from "../operacoes/alteraHorarioReuniao.js";

const mensagemTexto = async (consulta, numeroTel, mensagem, res) => {
    let checkCancelaReuniao = await cancelaReuniao(consulta, numeroTel, mensagem);

    let checkAlteraHorarioReuniao = await alteraHorarioReuniao(consulta, numeroTel, mensagem);
    
    if (!checkAlteraHorarioReuniao && !checkCancelaReuniao) {
        if (consulta.etapaFluxo === 'INICIAL') {
            const resposta = await estruturaMensagemTexto(mensagem);
            if (typeof resposta === "object" && resposta !== null) {

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
            let msg;
            switch (consulta.etapaFluxo) {
                case 'PESSOA_DUPLICADA': 
                    msg = 'Vocês possui uma reunião em agendamento, está na etapa de escolher o participante correto. Caso deseje cancelar a reunião em agendamento, digite "Cancelar reunião".'
                    await axios(textMessage(numeroTel, msg));

                    break;
                case 'CONFLITO_HORARIO': 
                    msg = 'Você possui uma reunião em agendamento, está na etapa de escolher o horário correto. Caso deseje cancelar a reunião em agendamento, digite "Cancelar reunião".'
                    await axios(textMessage(numeroTel, msg));
                    break;
                case 'CONFIRMACAO':
                    msg = 'Você possui uma reunião em agendamento, está na etapa de confirmação. Caso deseje cancelar a reunião em agendamento, digite "Cancelar reunião".'
                    await axios(textMessage(numeroTel, msg));
                    break;
                default: break;
            }
            res.status(200).json({ message: 'Message sent successfully' });
        }
    } else {
        res.status(200).json({ message: 'Reunião cancelada ou horário alterado com sucesso!' });
    }
}

export default mensagemTexto;
