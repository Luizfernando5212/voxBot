import { zodResponseFormat } from 'openai/helpers/zod';
import OpenAI from 'openai';
import z from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Objeto de validação do evento utilizando o Zod
const Evento = z.object({
    tipoMensagem: z.string().describe('Deve ser preenchido com um dos sequintes ["CANCELAR", "ALTERAR", "AGENDAR", "NDA"]'),
});

/**
 * @desc    Função para estruturar a mensagem utilizando o OpenAI
 * @param {String} texto - Mesangem recebida do usuário 
 * @returns {Object} - Objeto estruturado com as informações do evento
 */
async function verificaOperacao(texto) {
    try {
        let responseFormat = zodResponseFormat(Evento, 'evento');
        const reuniao = await openai.beta.chat.completions.parse({
            model: 'gpt-4o-mini-2024-07-18',
            messages: [
                { role: 'system', content: 'Você deve identificar qual é o tipo de operação, relativa a uma reunião, o usuário está tentando fazer,' +
                    'Cancelar, alterar ou agendar uma reunião. Caso não seja possível identificar, retorne "NDA".'
                 },
                { role: 'user', content: texto },
            ],
            response_format: responseFormat,
        });
        let resultado = reuniao.choices[0].message.parsed;
        return resultado;
    } catch (err) {
        console.log(err);
    }
}

export default verificaOperacao;