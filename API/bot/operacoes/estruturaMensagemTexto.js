import { zodResponseFormat } from 'openai/helpers/zod';
import OpenAI from 'openai';
import z from 'zod';
import Setor from "../../model/setor.js";
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Objeto de validação do evento utilizando o Zod
const Evento = z.object({
    titulo: z.string(),
    local: z.string().optional(),
    pauta: z.string().optional(),
    dataHoraInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)'),
    dataHoraFim: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ), apenas preencha caso esteja explícita.'),
    setor: z.string().optional().describe('Setor só deve ser preenchido caso não encontre participantes'),
    participantes: z.array(z.string()),
    isReuniao: z.boolean().describe('Deve ser true para ser considerado uma reunião válida.'),
    isSuficiente: z.boolean().describe('Deve ser true caso possua informações suficientes para agendar a reunião (titulo, dataHoraInicio, dataHoraFim, participantes).'),
});

/**
 * @desc    Função para estruturar a mensagem utilizando o OpenAI
 * @param {String} texto - Mesangem recebida do usuário 
 * @returns {Object} - Objeto estruturado com as informações do evento
 */
async function estruturaMensagemTexto(texto) {
    try {
        let responseFormat = zodResponseFormat(Evento, 'evento');
        const reuniao = await openai.beta.chat.completions.parse({
            model: 'gpt-4o-mini-2024-07-18',
            messages: [
                { role: 'system', content: 'Extraia as informações do evento/reunião, não produza informações, hoje é dia ' + new Date() +
                    ' E a reunião deve ser agendada para o futuro, não produza informações que não estejam explícitas no texto.' +
                    ' titulo, dataHoraInicio, dataHoraFim, (participantes ou setor) são informações obrigatórias.' +
                    ' Não converta as datas para o GMT do Brasil.' +
                    ' Você deve saber diferencias um setor de uma pessoa, o setor é o nome do departamento e a pessoa é o nome/apelido do funcionário.' +
                    ' isReuniao diz se a messagem é sobre reunião ou não, isSuficiente diz se possui informações suficientes para agendar a reunião.' },
                { role: 'user', content: texto },
            ],
            response_format: responseFormat,
        });
        let resultado = reuniao.choices[0].message.parsed;
        if (resultado.isReuniao) {
            if (resultado.isSuficiente) {
                if (resultado.setor === '') {
                    resultado.setor = null;
                    return resultado;
                } else {
                    // Trecho ficará responsável por buscar o setor no banco de dados
                    // e substituir o valor do setor no objeto resultado
                    const setor = await Setor.find({ descricao: resultado.setor });
                    resultado.setor = setor[0]._id;
                    return resultado;
                }
            } else {
                let msg = 'Não conseguimos identificar todas as informações necessárias para agendar a reunião. Por favor, informe: ';
                const camposObrigatorios = new Set(['titulo', 'dataHoraInicio', 'dataHoraFim', 'participantes']);
                const camposInvalidos = [];
                Object.entries(resultado).forEach(([key, value]) => {
                    if (camposObrigatorios.has(key) && (value == null || value === '' || value.length === 0)) {
                        camposInvalidos.push(key);
                    }
                });
                msg += camposInvalidos.join(', ');
                return msg;
            }
        } else {
            let msg = 'O VoxBot foi criado para agendar reuniões, por favor utilize-o para isso.' + 
                    ' Caso esteja deseje cancelar sua operação em andamento, envie "Cancelar" a qualquer momento.';
            return msg;
        }
    } catch (err) {
        console.log(err);
    }
}

export default estruturaMensagemTexto;