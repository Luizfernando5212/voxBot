import reuniao from "../../model/reuniao.js";
import axios from "axios";
import { textMessage } from '../../utll/requestBuilder.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import OpenAI from 'openai';
import z from 'zod';
import dotenv from 'dotenv';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import enviaNotificacaoReuniaoCancelada from "./notificaAlteracaoReuniao.js";

import { converteParaHorarioBrasilia, agoraBrasilia, converteParaHorarioUTC } from '../../utll/data.js';

dayjs.extend(utc);

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const Evento = z.object({
    dataHoraInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ), capture exatamente como o usuário informou.'),
    indCancelamento: z.boolean().optional().describe('Deve ser true caso o usuário queira cancelar a reunião.'),
});


/**
 * Função que cancela uma reunião.
 * 
 * @param {Object} consulta - Objeto que contém as informações da reunião
 * @param {String} numeroTel - Número de telefone do usuário
 * @param {String} texto - Mensagem recebida do usuário
 * @returns {Boolean} - Retorna true caso o assunto seja referente a cancelamento de reunião, false caso contrário.
 * @throws {Error} - Lança um erro caso não consiga cancelar a reunião
 */
async function cancelaReuniao(consulta, numeroTel, texto) {

    try {
        let resultado = await promptCancelaReuniao(texto);
        if (!resultado.indCancelamento) {
            console.log("Não quer cancelar")
            return false;
        } else if (resultado.dataHoraInicio === '') {
            if (consulta.etapaFluxo !== 'INICIAL' && consulta.reuniao !== null) {
                const reuniao_atual = await reuniao.findById(consulta.reuniao);
                reuniao_atual.status = 'Cancelada';
                await reuniao_atual.save();

                consulta.etapaFluxo = 'INICIAL';
                consulta.reuniao = null;
                await consulta.save();
                await axios(textMessage(numeroTel, 'Reunião cancelada com sucesso!'));
            } else {
                console.log('Usuário não informou a data/hora da reunião.');
                await axios(textMessage(numeroTel, 'Por favor, informe o dia e a data/hora da reunião que deseja cancelar.'));
            }
            return true;
        } else {
            const dataHoraInicio = dayjs(resultado.dataHoraInicio);

            console.log('dataHoraInicio', dataHoraInicio);
            console.log('resultado', resultado);

            const reuniao_encontrada = await reuniao.findOne({
                // titulo: resposta.titulo,
                dataHoraInicio: dataHoraInicio,
                status: 'Agendada',
                "organizador": consulta.pessoa._id
            })
            if (reuniao_encontrada === null) {
                console.log('Reunião não encontrada ou já cancelada.');
                await axios(textMessage(numeroTel, 'Reunião não encontrada ou já cancelada.'));
                return true;
            }

            reuniao_encontrada.status = 'Cancelada';
            await reuniao_encontrada.save()
            consulta.etapaFluxo = 'INICIAL';
            consulta.reuniao = null;
            await consulta.save();
            await enviaNotificacaoReuniaoCancelada(reuniao_encontrada, 'usuario_cancelou_reuniao', 'pt_PT');
            return true;
        }
    } catch (error) {
        console.error('Erro ao cancelar reunião:', error);
        return true;
    }
}


/**
 * Função que constrói o prompt para o OpenAI que verifica se o usuário quer cancelar uma reunião.
 * 
 * @param {String} texto - Mensagem recebida do usuário
 * @returns {Object} - Objeto com as informações da reunião
 */
async function promptCancelaReuniao(texto) {
    let horarioBrasil = agoraBrasilia();

    let responseFormat = zodResponseFormat(Evento, 'evento');
    const reuniao_cancelada = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [
            {
                role: 'system', content: 'Extraia as informações do evento e verifique se o usuário quer cancelar uma reunião, não produza informações, hoje é dia ' + horarioBrasil +
                    ' o usuário pode informar a dataHoraInicio da reunião que deseja cancelar, ou não informar nada.' +
                    ' dataHoraInicio se refere a data e hora de início da reunião.' +
                    ' indCancelamento diz se o usuário está querendo cancelar uma reunião.'
            },
            { role: 'user', content: texto },
        ],
        response_format: responseFormat,
    });

    return reuniao_cancelada.choices[0].message.parsed;
}


export default cancelaReuniao;
