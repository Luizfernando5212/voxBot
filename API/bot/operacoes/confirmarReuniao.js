import reuniao from "../../model/reuniao.js";
import participates from "../../model/participantes.js";
import { textMessage } from "../../utll/requestBuilder.js";
import mensagemConfirmacao from "./mensagemConfirmacao.js";
import axios from "axios";
import e from "express";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

import { converteParaHorarioBrasilia } from '../../utll/data.js';

dayjs.extend(utc);
dayjs.extend(timezone);


/**
 * 
 * @param {Object} consulta - Objeto de consulta de pessoa retornado do banco de dados 
 * @param {String} numeroTel - Número de telefone do participante 
 * @param {Object} mensagem - Objeto da mensagem enviada pelo WhatsApp
 * @param {Object} res - Resposta da requisição
 * @returns {Object} - Retorna resposta da requisição
 */
const confirmarReuniao = async (consulta, numeroTel, mensagem, res) => {
    if (!consulta.reuniao?._id) {
        res.status(200).json({ message: 'Não há reunião para ser confirmada' });
        return;
    }
    const reuniaoId = consulta.reuniao._id;
    let reuniaoAtual = await reuniao.findById(reuniaoId);    

    if (reuniaoAtual && consulta.etapaFluxo === 'CONFIRMACAO') {
        if (reuniaoAtual.status === 'Aguardando') {
            const resposta = mensagem.button_reply.id;
            const participante = await participates.findOne({ pessoa: consulta.pessoa._id, reuniao: reuniaoId });
            if (resposta === 'CONFIRMAR') {
                reuniaoAtual.status = 'Agendada';
                consulta.etapaFluxo = 'INICIAL';
                consulta.reuniao = null;
                participante.conviteAceito = true;
                participante.save();
                consulta.save();
                await reuniaoAtual.save();
                const horaInicio = dayjs(reuniaoAtual.dataHoraInicio).format('DD/MM/YYYY HH:mm [até]');
                const horaFim = dayjs(reuniaoAtual.dataHoraFim).format('HH:mm');

                console.log(`Reunião confirmada: ${horaInicio} ${horaFim}`);
                await axios(textMessage(numeroTel, `Convite de reunião enviado com sucesso para ${horaInicio} ${horaFim}.`));
                mensagemConfirmacao(consulta, reuniaoAtual);
            } else if (resposta === 'CANCELAR') {
                consulta.etapaFluxo = 'INICIAL';
                consulta.reuniao = null;
                consulta.save();
                await axios(textMessage(numeroTel, 'Reunião cancelada.'));
            }
            res.status(200).json({ message: 'Reunião confirmada ou cancelada com sucesso' });
        } else {
            await axios(textMessage(numeroTel, 'Reunião já agendada ou cancelada.'));
            return res.status(400).json({ error: 'Reunião já agendada ou cancelada' });
        }
    } else {
        if (reuniaoAtual.status === 'Agendada') {
            try {
                const participante = await participates.findOne({ pessoa: consulta.pessoa._id, reuniao: reuniaoId });
                const resposta = mensagem.payload;
                if (resposta === 'Aceitar') {
                    participante.conviteAceito = true;
                    participante.save();
                    await axios(textMessage(numeroTel, 'Reunião aceita com sucesso.'));
                }
                else if (resposta === 'Recusar') {
                    participante.conviteAceito = false;
                    participante.save();
                    await axios(textMessage(numeroTel, 'Reunião recusada.'));
                }
                consulta.reuniao = null;
                consulta.save();
                return res.status(200).json({ message: 'Reunião aceita ou recusada com sucesso' });
            } catch (error) {
                console.error('Erro ao confirmar reunião:', error);
                await axios(textMessage(numeroTel, 'Erro ao confirmar reunião.'));
                return res.status(500).json({ error: 'Erro ao confirmar reunião' });
            }

        }
    }
    return null;
}

export default confirmarReuniao;
