import reuniao from "../../model/reuniao.js";
import participantes from "../../model/participantes.js";
import telefones from '../../model/telefone.js';
import axios from "axios";
import { textMessage, templateMessage } from '../../utll/requestBuilder.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import OpenAI from 'openai';
import z from 'zod';
import dotenv from 'dotenv';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const Evento = z.object({
    indListaReuniao: z.boolean().optional().describe('Deve ser true caso o usuário queira listar ou verificar suas reuniões.'),
});


async function listaReuniao(consulta, numeroTel, texto) {
    try{
        let resultado = await promptListarReuniaso(texto);
        if (!resultado.indListaReuniao) {
            console.log("Não deseja verificar reuniões.");
            return false;
        }
        const reunioes_encontradas = await reuniao.find({
                status: 'Agendada',
                "organizador": consulta.pessoa._id
        })
        const mensagem = formatarListaReunioes(reunioes_encontradas);
        await axios(textMessage(numeroTel, mensagem));
        return true;
    } catch (error) {
        console.error('Erro ao processar a solicitação de reunião:', error);
    }
}

/**
 * Função que constrói o prompt para o OpenAI que verifica se o usuário quer cancelar uma reunião.
 * 
 * @param {String} texto - Mensagem recebida do usuário
 * @returns {Object} - Objeto com as informações da reunião
 */
async function promptListarReuniaso(texto) {
    let responseFormat = zodResponseFormat(Evento, 'evento');
    const reuniao_cancelada = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [
            { role: 'system', content: 'Verifique se o usuário deseja listar ou verificar suas respectivas reuniões, não produza informações. ' +
                ' indListaReuniao diz se o usuário está querendo listar ou verificar suas respectivas reuniões.' },
            { role: 'user', content: texto },
        ],
        response_format: responseFormat,
    });
    
    return reuniao_cancelada.choices[0].message.parsed;
}


function formatarListaReunioes(reunioes) {
    if (!reunioes || reunioes.length === 0) {
        return "Você não possui reuniões agendadas.";
    }
    let mensagem = "*Suas reuniões agendadas:*\n\n";
    reunioes.forEach((r, i) => {
        mensagem += `*${i + 1}.* 📅 *Título:* ${r.titulo || "Sem título"}\n`;
        mensagem += `   🕒 *Data:* ${dayjs.utc(r.dataHoraInicio).format("DD/MM/YYYY [às] HH:mm")}\n`;
    });
    return mensagem.trim();
}


export default listaReuniao;