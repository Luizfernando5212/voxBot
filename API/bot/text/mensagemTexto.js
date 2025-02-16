import axios from "axios";
import { textMessage } from '../../utll/requestBuilder.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import OpenAI from 'openai';
import z from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });


const Evento = z.object({
    titulo: z.string(),
    local: z.string().optional(),
    pauta: z.string().optional(),
    dataHoraInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)'),
    dataHoraFim: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)'),
    setor: z.string().optional().describe('Setor só deve ser preenchido caso não encontre participantes'),
    participantes: z.array(z.string()),
    isDentroTema: z.boolean().describe('Deve ser true para ser considerado uma reunião válida.')
});
// Tentativa de validar data diretamente com o zod
// .refine(dataHoraFim => {
//     const dataFim = new Date(dataHoraFim);
//     return dataFim > new Date();
// }, {
//     message: 'A data-hora deve ser maior que a data atual'
// })

async function estruturaMensagemTexto(texto) {
    try {

        let responseFormat = zodResponseFormat(Evento, 'evento');
        const reuniao = await openai.beta.chat.completions.parse({
            model: 'gpt-4o-mini-2024-07-18',
            messages: [
                { role: 'system', content: 'Extraia as informações do evento/reunião. Caso não haja informações o suficiente, preencha apenas o campo isDentroTema com false' },
                { role: 'user', content: texto },
            ],
            response_format: responseFormat,
        });
        let resultado = reuniao.choices[0].message.parsed;
        console.log(resultado);
        if (resultado.isDentroTema) {
            return resultado;
        } else {
            let msg = 'Não identificamos algunas informações na sua mensagem. Por favor, informe: ';
            const camposObrigatorios = new Set(['titulo', 'dataHoraInicio', 'dataHoraFim', 'participantes']);
            Object.entries(resultado).forEach(([key, value]) => {
                if (camposObrigatorios.has(key) && (value == null || value === '')) {
                    msg += key  + ', ';
                }
            });    

            return msg;
        }
    } catch (err) {
        console.log(err);
        // null
    }
}

const mensagemTexto = async (consulta, numeroTel, mensagem, res) => {
    const resposta = estruturaMensagemTexto(mensagem)
    try {
        await axios(textMessage(numeroTel, resposta))
        res.status(200).json({ message: 'Message sent successfully' });
    } catch (err) {
        res.status(400).json({ error: 'Error sending message' + err });
    }

}

export default mensagemTexto;