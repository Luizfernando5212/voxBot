import reuniao from "../../model/reuniao.js";
import axios from "axios";
import { textMessage } from '../../utll/requestBuilder.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import OpenAI from 'openai';
import z from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const Evento = z.object({
    dataHoraInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)'),
    novoHorarioInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)'),
    novoHorarioFim: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)'),
    indAlteracaoHorario: z.boolean().optional().describe('Deve ser true caso o usuário deseje alterar o horário de uma reunião.'),
});


async function alteraHorarioReuniao(consulta, numeroTel, texto){
    try {
        let responseFormat = zodResponseFormat(Evento, 'evento');
        const reuniao_cancelada = await openai.beta.chat.completions.parse({
            model: 'gpt-4o-mini-2024-07-18',
            messages: [
                { role: 'system', content: 'Extraia as informações do evento e verifique se o usuário quer alterar o horário de uma reunião, não produza informações, hoje é dia ' + new Date() +
                    ' dataHoraInicio, é uma informação obrigatória.' +
                    ' novoHorarioInicio é uma informação obrigatório, pois se refere ao novo horário de início para a reunião' +
                    ' novoHorarioFim é uma informação obrigatório, pois se refere ao novo horário de fim para a reunião' +
                    ' indCancelamento diz se o usuário está querendo cancelar uma reunião.' },
                { role: 'user', content: texto },
            ],
            response_format: responseFormat,
        });
        let resultado = reuniao_cancelada.choices[0].message.parsed;
        if (!resultado.indAlteracaoHorario) {
            console.log("Não quer alterar o hor´rio")
            return;
        } else if (resultado.dataHoraInicio === '') {
            console.log('Usuário não informou a data/hora da reunião.');
            await axios(textMessage(numeroTel, 'Informe a data/hora da reunião que deseja alterar o horário.'));
            return;
        } else if (resultado.novoHorarioInicio == '' || resultado.novoHorarioFim == '') {
            console.log('Usuário não informou a nova data/hora da reunião.');
            await axios(textMessage(numeroTel, 'Verifique se informou corretamente os novos horários para a reunião.'));
            return;
        } else {
            const reuniao_encontrada = await reuniao.findOne({
                // titulo: resposta.titulo,
                dataHoraInicio: resultado.dataHoraInicio,
                status: 'Agendada',
                "organizador": consulta.pessoa._id
            })

            reuniao_encontrada.dataHoraInicio = resultado.novoHorarioInicio
            reuniao_encontrada.dataHoraFim = resultado.novoHorarioFim
            await reuniao_encontrada.save()
        }
    } catch (err) {
        console.log(`Não foi possível alterar o horário da reunião ${err}`)
    }
}

export default alteraHorarioReuniao;