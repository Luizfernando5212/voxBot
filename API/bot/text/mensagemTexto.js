import axios from "axios";
import { textMessage } from '../../utll/requestBuilder.js';
import agendaReuniao from "../operacoes/agendaReuniao.js";
import estruturaMensagemTexto from "../operacoes/estruturaMensagemTexto.js";
import cancelaReuniao from "../operacoes/cancelaReuniao.js";
import alteraHorarioReuniao from "../operacoes/alteraHorarioReuniao.js";
import verificaOperacao from "../operacoes/verificaOperacaoTxt.js";
import listaReuniao from "../operacoes/listaReuniao.js";

const mensagemTexto = async (consulta, numeroTel, mensagem, res) => {
    let checkCancelaReuniao = true;
    let checkAlteraHorarioReuniao = true;
    let checkListarReuniao = true;
    
    await verificaOperacao(mensagem).then(async (resposta) => {
        if (resposta.tipoMensagem === 'CANCELAR') {
            checkCancelaReuniao = await cancelaReuniao(consulta, numeroTel, mensagem);
        } else if (resposta.tipoMensagem === 'ALTERAR') {
            checkAlteraHorarioReuniao = await alteraHorarioReuniao(consulta, numeroTel, mensagem);
        }else if (resposta.tipoMensagem === 'LISTAR') {
            checkListarReuniao = await listaReuniao(consulta, numeroTel, mensagem);
        } else if (resposta.tipoMensagem === 'AGENDAR' || resposta.tipoMensagem === 'NDA') {
            checkAlteraHorarioReuniao = false;
            checkCancelaReuniao = false;
            checkListarReuniao = false;
        }
    }).catch((err) => {
        console.log(err);
        checkAlteraHorarioReuniao = false;
        checkCancelaReuniao = false;
    });

    if (!checkAlteraHorarioReuniao && !checkCancelaReuniao && !checkListarReuniao) {
        if (consulta.etapaFluxo === 'INICIAL') {
            const resposta = await estruturaMensagemTexto(mensagem);
            if (typeof resposta === "object" && resposta !== null) {

                try {
                    await agendaReuniao(consulta, resposta, res);
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
