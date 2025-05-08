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
    indCancelamento: z.boolean().optional().describe('Deve ser true caso o usuário queira cancelar a reunião.'),
});

async function cancelaReuniao(consulta, numeroTel, texto) {

    try {
        let responseFormat = zodResponseFormat(Evento, 'evento');
        const reuniao_cancelada = await openai.beta.chat.completions.parse({
            model: 'gpt-4o-mini-2024-07-18',
            messages: [
                { role: 'system', content: 'Extraia as informações do evento e verifique se o usuário quer cancelar uma reunião, não produza informações, hoje é dia ' + new Date() +
                    ' dataHoraInicio, é uma informação obrigatória.' +
                    ' indCancelamento diz se o usuário está querendo cancelar uma reunião.' },
                { role: 'user', content: texto },
            ],
            response_format: responseFormat,
        });
        
        let resultado = reuniao_cancelada.choices[0].message.parsed;
        
        if (!resultado.indCancelamento) {
            console.log("Não quer cancelar")
            return;
        } else if (resultado.dataHoraInicio === '') {
            console.log('Usuário não informou a data/hora da reunião.');
            await axios(textMessage(numeroTel, 'Informe a data/hora da reunião que deseja cancelar.'));
            return;
        } else {
            const reuniao_encontrada = await reuniao.findOne({
                // titulo: resposta.titulo,
                dataHoraInicio: resultado.dataHoraInicio,
                status: 'Agendada',
                "organizador": consulta.pessoa._id
            })

            if (reuniao_encontrada === null) {
                console.log('Reunião não encontrada ou já cancelada.');
                await axios(textMessage(numeroTel, 'Reunião não encontrada ou já cancelada.'));
                return;
            }

            console.log(reuniao_encontrada)
            reuniao_encontrada.status = 'Cancelada';
            await reuniao_encontrada.save()
        }
    } catch (error) {
        console.error('Erro ao cancelar reunião:', error);
    }
}

export default cancelaReuniao;