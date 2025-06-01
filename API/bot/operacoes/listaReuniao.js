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
    dataHoraInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDT00:00:00Z)'),
    indListaReuniao: z.boolean().optional().describe('Deve ser true caso o usuário queira listar ou verificar suas reuniões.'),
});


async function listaReuniao(consulta, numeroTel, texto) {
    try{
        let reunioes_encontradas;
        let resultado = await promptListarReuniaso(texto);
        if (!resultado.indListaReuniao) {
            console.log("Não deseja verificar reuniões.");
            return false;
        }
        if (resultado.dataHoraInicio !== '') {
            let dataHoraFim = dayjs.utc(resultado.dataHoraInicio).set('hour', 23).set('minute', 59).set('second', 59).toISOString();
            reunioes_encontradas = await reuniao.find({
                dataHoraInicio: { $gte: new Date(resultado.dataHoraInicio), $lte: new Date(dataHoraFim) },
                status: 'Agendada',
                "organizador": consulta.pessoa._id
            });
        } else {
            reunioes_encontradas = await reuniao.find({
                    status: 'Agendada',
                    "organizador": consulta.pessoa._id
            })
        }
        console.log(resultado)
        consulta.etapaFluxo = 'INICIAL';
        consulta.reuniao = null;
        await consulta.save();
        
        const mensagem = formatarListaReunioes(reunioes_encontradas);
        console.log(mensagem);
        // await axios(textMessage(numeroTel, mensagem));
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
            { role: 'system', content: 'Verifique se o usuário deseja listar/verificar suas respectivas reuniões, não produza informações, hoje é dia ' + new Date() +
                ' dataHoraInicio deve ser a data e hora do dia em que o usuário deseja listar as reuniões, caso ele não forneça data, não preencha esse campo.' +
                ' indListaReuniao diz se o usuário está querendo listar/verificar suas reuniões.' },
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
    console.log(reunioes);
    reunioes.forEach((r, i) => {
        console.log(r.dataHoraInicio, r.dataHoraFim);
        mensagem += `*${i + 1}.* 📅 *Título:* ${r.titulo || "Sem título"}\n`;
        mensagem += `   🕒 *Data:* ${dayjs(r.dataHoraInicio).format("DD/MM/YYYY, [Inicia às] HH:mm")}, ${dayjs(r.dataHoraFim).format("DD/MM/YYYY, [Finaliza às] HH:mm")}\n\n`;
    });
    return mensagem.trim();
}


export default listaReuniao;