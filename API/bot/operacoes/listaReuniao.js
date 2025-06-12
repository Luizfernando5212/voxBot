import reuniao from "../../model/reuniao.js";
import Participantes from "../../model/participantes.js";
import moment from "moment-timezone";;
import axios from "axios";
import { textMessage, templateMessage } from '../../utll/requestBuilder.js';
import { zodResponseFormat } from 'openai/helpers/zod';
import OpenAI from 'openai';
import z from 'zod';
import dotenv from 'dotenv';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import participantes from "../../model/participantes.js";
import { agoraBrasilia } from "../../utll/data.js";

import { converteParaHorarioBrasilia } from '../../utll/data.js';
dayjs.extend(utc);
dayjs.extend(timezone);

dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const Evento = z.object({
    dataHoraInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDT00:00:00Z)'),
    indListaReuniao: z.boolean().optional().describe('Deve ser true caso o usuário queira listar ou verificar suas reuniões.'),
    indHistoricoReuniao: z.boolean().optional().describe('Deve ser true caso o usuário queira ver o histórico de reuniões.'),
});


async function listaReuniao(consulta, numeroTel, texto, payloadVerificaReuniao = false) {
    try {
        if (!payloadVerificaReuniao) {
            let resultado = await promptListarReuniaso(texto);

            console.log(resultado);

            if (!resultado.indListaReuniao && !resultado.indHistoricoReuniao) {
                console.log("Não deseja verificar reuniões.");
                return false;
            }

            if (resultado.dataHoraInicio !== '') {
                let dataHoraFim = dayjs.utc(resultado.dataHoraInicio).set('hour', 23).set('minute', 59).set('second', 59).toISOString();

                const reunioesParticipadas = await Participantes.find({
                    pessoa: consulta.pessoa._id,
                    conviteAceito: true // opcional, se quiser filtrar apenas quem confirmou presença
                }).distinct('reuniao');

                console.log("Reuniões participadas:", reunioesParticipadas);

                const reunioes_encontradas = await reuniao.find({
                    _id: { $in: reunioesParticipadas },
                    dataHoraInicio: { $gte: new Date(resultado.dataHoraInicio), $lte: new Date(dataHoraFim) },
                    status: 'Agendada',
                })
                    .populate('organizador', 'nome')
                    .sort({ dataHoraInicio: 1 });
                const mensagem = await formatarListaReunioes(reunioes_encontradas);
                await axios(textMessage(numeroTel, mensagem));
                consulta.etapaFluxo = 'INICIAL';
                consulta.reuniao = null;
                await consulta.save();
                return true;

            } else if (resultado.indHistoricoReuniao) {
                const reunioesParticipadas = await Participantes.find({
                    pessoa: consulta.pessoa._id,
                    conviteAceito: true // opcional, se quiser filtrar apenas quem confirmou presença
                }).distinct('reuniao');

                const reunioes_encontradas = await reuniao.find({
                    _id: { $in: reunioesParticipadas },
                    status: 'Agendada',
                    // "organizador": consulta.pessoa._id
                })
                    .populate('organizador', 'nome')
                    .sort({ dataHoraInicio: 1 });
                const mensagem = await formatarListaReunioes(reunioes_encontradas);
                await axios(textMessage(numeroTel, mensagem));
                consulta.etapaFluxo = 'INICIAL';
                consulta.reuniao = null;
                await consulta.save();
                return true;

            } else {
                var now = agoraBrasilia();
                const reunioesParticipadas = await Participantes.find({
                    pessoa: consulta.pessoa._id,
                    conviteAceito: true // opcional, se quiser filtrar apenas quem confirmou presença
                }).distinct('reuniao');

                console.log("Reuniões participadas:", reunioesParticipadas);

                const reunioes_encontradas = await reuniao.find({
                    _id: { $in: reunioesParticipadas },
                    dataHoraInicio: { $gte: now },
                    status: 'Agendada',
                    // "organizador": consulta.pessoa._id
                })
                    .populate('organizador', 'nome')
                    .sort({ dataHoraInicio: 1 });
                if (reunioes_encontradas.length === 0) {
                    await axios(textMessage(numeroTel, "Você não possui reuniões agendadas."));
                    consulta.etapaFluxo = 'INICIAL';
                    consulta.reuniao = null;
                    await consulta.save();
                    return true;
                }
                const mensagem = await formatarListaReunioes(reunioes_encontradas);
                await axios(textMessage(numeroTel, mensagem));
                consulta.etapaFluxo = 'INICIAL';
                consulta.reuniao = null;
                await consulta.save();
                return true;
            }

        } else {
            var now = agoraBrasilia();

            const reunioesParticipadas = await Participantes.find({
                pessoa: consulta.pessoa._id,
                conviteAceito: true // opcional, se quiser filtrar apenas quem confirmou presença
                }).distinct('reuniao');
            const reunioes_encontradas = await reuniao.find({
                _id: { $in: reunioesParticipadas },
                dataHoraInicio: { $gte: now },
                status: 'Agendada',
                // "organizador": consulta.pessoa._id
            })
                .populate('organizador', 'nome')
                .sort({ dataHoraInicio: 1 });

            if (reunioes_encontradas.length === 0) {
                await axios(textMessage(numeroTel, "Você não possui reuniões agendadas."));
                consulta.etapaFluxo = 'INICIAL';
                consulta.reuniao = null;
                await consulta.save();
                return true;
            }

            const mensagem = await formatarListaReunioes(reunioes_encontradas);
            await axios(textMessage(numeroTel, mensagem));
            consulta.etapaFluxo = 'INICIAL';
            consulta.reuniao = null;
            await consulta.save();
            return true;
        }

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
            {
                role: 'system', content: 'Verifique se o usuário deseja listar/verificar suas respectivas reuniões, não produza informações, hoje é dia ' + new Date() +
                    ' dataHoraInicio deve ser a data e hora do dia em que o usuário deseja listar as reuniões, caso ele não forneça data, não preencha esse campo.' +
                    ' indListaReuniao diz se o usuário está querendo listar/verificar suas reuniões.' +
                    ' indHistoricoReuniao diz se o usuário está querendo listar/verificar todas as reuniões, ou seja, o histórico completo.'
            },
            { role: 'user', content: texto },
        ],
        response_format: responseFormat,
    });

    return reuniao_cancelada.choices[0].message.parsed;
}

async function formatarListaReunioes(reunioes) {
    if (!reunioes || reunioes.length === 0) {
        return "Você não possui reuniões agendadas.";
    }


    // Busca todos os participantes em paralelo
    const participantesPorReuniao = await Promise.all(
        reunioes.map(r =>
            Participantes.find({
                reuniao: r._id,
                conviteAceito: true,
                pessoa: { $ne: r.organizador }
            }).populate('pessoa', 'nome'),
        )
    );


    let mensagem = "*Suas reuniões agendadas:*\n\n";


    reunioes.forEach((r, i) => {
        r.toObject(); // Converte o documento para objeto JavaScript convertendo as datas para o formato correto
        console.log(r);
        const participantes = participantesPorReuniao[i];
        const horarioInicio = dayjs(r.dataHoraInicio).format("DD/MM/YYYY, [Inicia às] HH:mm");
        const horarioFim = dayjs(r.dataHoraFim).format("[Finaliza às] HH:mm");

        mensagem += `*${i + 1}.* 📅 *Título:* ${r.titulo || "Sem título"}\n`;
        mensagem += `   🕒 *Data:* ${horarioInicio}, ${horarioFim}\n`;
        mensagem += `📣 *Organizador:* ${r.organizador.nome}\n`


        const participantesFiltrados = participantes.filter(
            p => p.pessoa._id.toString() !== r.organizador.toString()
        )


        if (participantesFiltrados.length > 0) {
            const nomes = participantesFiltrados.map(p => p.pessoa.nome).join(', ');
            mensagem += `   👥 *Participantes confirmados:* ${nomes}\n\n`;
        } else {
            mensagem += "   👥 *Participantes:* Nenhum participante confirmado.\n\n";
        }
    });
    console.log(mensagem);
    return mensagem.trim();
}

export default listaReuniao;
