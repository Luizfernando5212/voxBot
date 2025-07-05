import reuniao from "../../model/reuniao.js";
import axios from "axios";
import { textMessage } from '../../utll/requestBuilder.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import OpenAI from 'openai';
import z from 'zod';
import dotenv from 'dotenv';
import enviaNotificacaoAlteracaoHorario from "./notificaAlteracaoReuniao.js";

import { agoraBrasilia, converteParaHorarioUTC } from '../../utll/data.js';


import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const Evento = z.object({
    dataHoraInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ), capture exatamente como o usuário informou.'),
    novoHorarioInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ), capture exatamente como o usuário informou.'),
    novoHorarioFim: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ), apenas preencha caso esteja explícita, capture exatamente como o usuário informou.'),
    indAlteracaoHorario: z.boolean().optional().describe('Deve ser true caso o usuário deseje alterar o horário de uma reunião.'),
    indMudancaDia: z.boolean().optional().describe('Deve ser true caso o usuário deseje alterar o dia de uma reunião.'),
});

/**
 * Função que altera o horário de uma reunião.
 * 
 * @param {Object} consulta - Objeto que contém as informações da reunião
 * @param {String} numeroTel - Número de telefone do usuário
 * @param {String} texto - Mensagem recebida do usuário
 * @returns {Boolean} - Retorna true caso o assunto seja referente a alteração de horário, false caso contrário.
 * @throws {Error} - Lança um erro caso não consiga alterar o horário
 */
async function alteraHorarioReuniao(consulta, numeroTel, texto) {
    try {
        let resultado = await promptAlteracaoHorario(texto);
        if (!resultado.indAlteracaoHorario && !resultado.indMudancaDia) {
            console.log("Não quer alterar o horário")
            return false;
        } else if (resultado.dataHoraInicio === '') {
            console.log('Usuário não informou a data/hora da reunião.');
            await axios(textMessage(numeroTel, 'Por gentileza, informe corretamente os horários da reunião que deseja alterar.'));
            return true;
        } else if (resultado.novoHorarioInicio == '' || resultado.novoHorarioInicio == null) {
            console.log('Usuário não informou a nova data/hora da reunião.');
            await axios(textMessage(numeroTel, 'Por gentileza, informe corretamente os horários da reunião que deseja alterar.'));
            return true;
        } else {
            try {
                const reuniao_encontrada = await updateHorarioReuniaoMongoDB(resultado, numeroTel, consulta);
                if (reuniao_encontrada === null) {
                    return true;
                }
                consulta.etapaFluxo = 'INICIAL';
                consulta.reuniao = null;
                await reuniao_encontrada.save()

                console.log('depois de salvar', reuniao_encontrada);
                await consulta.save();
                await enviaNotificacaoAlteracaoHorario(reuniao_encontrada, 'usuario_alterou_horario_reuniao');
                return true;
            } catch (error) {
                console.log(`Houve um problema na alteração do horário: ${error}`);
                return true;
            }
        }
    } catch (err) {
        console.log(`Não foi possível alterar o horário da reunião ${err}`)
        return true;
    }
}

/**
 * 
 * @param {Object} resultado - Objeto que contém as informações da reunião
 * @param {String} numeroTel - Número de telefone do usuário
 * @param {Object} consulta - Objeto que contém as informações do usuário
 * @returns {Object|null} - Retorna o objeto da reunião atualizada ou null se não encontrar a reunião
 */
async function updateHorarioReuniaoMongoDB(resultado, numeroTel, consulta) {
    try {
        // let horarioBrasil = dayjs().tz("America/Sao_Paulo").toDate();
        // horarioBrasil = horarioBrasil.subtract(3, 'hour').toDate();

        let horarioBrasil = agoraBrasilia();
        console.log('horario Brasil', horarioBrasil);
        console.log(resultado);
        let dates = {
            dataHoraInicio: dayjs(resultado.dataHoraInicio).toDate(),
            novoHorarioInicio: dayjs(resultado.novoHorarioInicio).toDate(),
            novoHorarioFim: dayjs(resultado.novoHorarioFim).toDate(),
        }

        console.log(dates);
        
        const reuniao_encontrada = await reuniao.findOne({
            dataHoraInicio: {
                $gte: dayjs(dates.dataHoraInicio).startOf('minute'),
                $lte: dayjs(dates.dataHoraInicio).endOf('minute')
            },
            status: 'Agendada',
            organizador: consulta.pessoa._id
        });


        if (reuniao_encontrada === null) {
            await axios(textMessage(numeroTel, '❗Reunião não encontrada, verifique se informou corretamente a data/hora da reunião e qual período acontecerá (Manhã, Tarde ou Noite).'));
            return null;
        }


        const duracaoReuniao = dayjs.utc(reuniao_encontrada.dataHoraFim).diff(dayjs.utc(reuniao_encontrada.dataHoraInicio), 'minute');

        if (resultado.novoHorarioFim && resultado.novoHorarioFim.trim() !== '') {
            dates.novoHorarioFim = new Date(dayjs(resultado.novoHorarioFim).toDate());
        } else {
            dates.novoHorarioFim = new Date(dates.novoHorarioInicio.getTime() + duracaoReuniao * 60000); // Adiciona a duração da reunião ao novo horário de início
        }

        if (reuniao_encontrada.dataHoraInicio.getTime() === dates.novoHorarioInicio.getTime() &&
            !isNaN(dates.novoHorarioInicio.getTime()) &&
            reuniao_encontrada.dataHoraFim.getTime() === dates.novoHorarioFim.getTime()) {
            await axios(textMessage(numeroTel, '❗A reunião já possui esse horário.'));
            return null;
        }

        //Muda apenas o dia da dataHoraFim caso o usuário tenha alterado o dia da reunião
        if (resultado.indMudancaDia) {
            reuniao_encontrada.dataHoraFim = new Date(
                dates.novoHorarioInicio.getFullYear(),
                dates.novoHorarioInicio.getMonth(),
                dates.novoHorarioInicio.getDate(),
                reuniao_encontrada.dataHoraFim.getHours(),
                reuniao_encontrada.dataHoraFim.getMinutes(),
                reuniao_encontrada.dataHoraFim.getSeconds()
            )
        }

        reuniao_encontrada.dataHoraInicio = dates.novoHorarioInicio

        if (dates.novoHorarioFim) {
            reuniao_encontrada.dataHoraFim = dates.novoHorarioFim
        }

        console.log('antes de salvar ', reuniao_encontrada);

        if (dates.novoHorarioInicio.getTime() === reuniao_encontrada.dataHoraFim.getTime()) {
            await axios(textMessage(numeroTel, '❗O horário de início não pode ser igual ao horário de fim da reunião. Por gentileza informe um horário de início e de fim para a reunião;'));
            return null;
        } else if (dates.novoHorarioInicio.getTime() > reuniao_encontrada.dataHoraFim.getTime()) {
            await axios(textMessage(numeroTel, '❗O horário de início é maior que o horário de fim da reunião, por gentileza informe um novo horário para a reunião finalizar.'));
            return null;
        } else if (dates.novoHorarioInicio.getTime() < horarioBrasil.getTime()) {
            await axios(textMessage(numeroTel, '❗Não é possível alterar o horário da reunião para o passado, por gentileza informe um novo horário para a reunião iniciar.'));
            return null;
        }
        const validaExitenciaReuniao = await reuniao.find({
            $or: [
                {
                    dataHoraInicio: { $lt: reuniao_encontrada.dataHoraFim },
                    dataHoraFim: { $gt: reuniao_encontrada.dataHoraInicio }
                }
            ],
            status: 'Agendada',
            "organizador": consulta.pessoa._id,
            _id: { $ne: reuniao_encontrada._id }
        })

        if (validaExitenciaReuniao.length > 0) {
            await axios(textMessage(numeroTel, '❗Conflito de horário, você já possui uma reunião agendada durante esse período.'));
            return null;
        }

        return reuniao_encontrada;
    } catch (error) {
        console.error(`Erro ao atualizar o horário da reunião: ${error}`);
        return null;
    }
}


/**
 * Função que constrói o prompt para o OpenAI, com as informações necessárias para alterar o horário da reunião.
 * 
 * @param {String} texto - Mensagem recebida do usuário
 * @returns {Object} - Objeto com as informações extraídas do texto
 */
async function promptAlteracaoHorario(texto) {
    // let horarioBrasil = dayjs().tz("America/Sao_Paulo");
    // horarioBrasil = horarioBrasil.subtract(3, 'hour').toDate();
    let horarioBrasil = agoraBrasilia();

    let responseFormat = zodResponseFormat(Evento, 'evento');
    const reuniao_alterada = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [
            {
                role: 'system', content: 'Extraia as informações do evento, identifique horários e verifique se o usuário deseja alterar o horário de uma reunião, você deve compreender linguagens como hoje, amanhã, semana que vem e outras variações. Não produza informações, ' +
                    'hoje é dia ' + horarioBrasil + '.'  +
                    ' dataHoraInicio, é uma informação obrigatória, pois se refere ao horário da reunião que está sendo buscada.' +
                    ' novoHorarioInicio é uma informação obrigatório, pois se refere ao novo horário de início para a reunião.' +
                    ' novoHorarioFim é uma informação opcional, se refere ao novo horário de fim para a reunião.' +
                    ' indAlteracaoHorario é um booleano que indica se o usuário está querendo alterar o horário de uma reunião.' +
                    ' indMudancaDia é um booleano que indica se o usuário está mudando o dia da reunião e não só o horário.'
            },
            { role: 'user', content: texto },
        ],
        response_format: responseFormat,
    });
    console.log(horarioBrasil);

    console.log(texto);
    
    let resultado = reuniao_alterada.choices[0].message.parsed;

    return resultado;
}

export default alteraHorarioReuniao;
