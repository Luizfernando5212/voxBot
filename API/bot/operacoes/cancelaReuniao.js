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
    dataHoraInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ), não deve ser convertido para UTC, mantenha o Z no final, capture exatamente como o usuário informou.'),
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
            if(consulta.etapaFluxo !== 'INICIAL' && consulta.reuniao !== null) {
                const reuniao_atual = await reuniao.findById(consulta.reuniao);
                reuniao_atual.status = 'Cancelada';
                await reuniao_atual.save();
                
                consulta.etapaFluxo = 'INICIAL';
                consulta.reuniao = null;
                await consulta.save();
                await axios(textMessage(numeroTel, 'Reunião cancelada com sucesso!'));
            } else {
                console.log('Usuário não informou a data/hora da reunião.');
                await axios(textMessage(numeroTel, 'Informe a data/hora da reunião que deseja cancelar.'));
            }
            return true;
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
                return true;
            }

            reuniao_encontrada.status = 'Cancelada';
            await reuniao_encontrada.save()
            consulta.etapaFluxo = 'INICIAL';
            consulta.reuniao = null;
            await consulta.save();
            await enviaNotificacaoReuniaoCancelada(reuniao_encontrada);
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
    let responseFormat = zodResponseFormat(Evento, 'evento');
    const reuniao_cancelada = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [
            { role: 'system', content: 'Extraia as informações do evento e verifique se o usuário quer cancelar uma reunião, não produza informações, hoje é dia ' + new Date() +
                ' o usuário pode informar a dataHoraInicio da reunião que deseja cancelar, ou não informar nada.' +
                ' dataHoraInicio não deve ser convertido para UTC em hipótese nenhuma e não acrescente em hipótese nenhuma o -03:00, mantenha o Z no final.' +
                ' indCancelamento diz se o usuário está querendo cancelar uma reunião.' },
            { role: 'user', content: texto },
        ],
        response_format: responseFormat,
    });
    
    return reuniao_cancelada.choices[0].message.parsed;
}


/**
 * A função enviaNotificacaoReuniaoCancelada envia uma notificação de alteração de horário de reunião para os participantes.
 * 
 * @param {Object} reuniao_encontrada - Objeto que contém os dados da reunião encontrada
 * @throws {Error} - Lança um erro caso não consiga enviar a notificação
 * @returns {Promise<void>} - Promise que resolve quando a notificação é enviada
 */
async function enviaNotificacaoReuniaoCancelada(reuniao_encontrada) {
    try {
            const id_reuniao = reuniao_encontrada._id.toString();
    
            const parcitipante = await participantes.find({
                reuniao: { $in: id_reuniao },
                conviteAceito: true
            });
    
            const id_pessoa = parcitipante.map(p => p.pessoa.toString());
    
            const telefone = await telefones.find({
                pessoa: { $in: id_pessoa }
            })
    
            for (const participante of parcitipante) {
                
                const tel = telefone.find(t => t.pessoa.toString() === participante.pessoa.toString());
                
                if (tel){
                    try {
                        const dataHoraInicio = dayjs.utc(reuniao_encontrada.dataHoraInicio).format('HH:mm [do dia] DD/MM/YYYY');
                        const dataHoraFim = dayjs.utc(reuniao_encontrada.dataHoraFim).format('HH:mm [do dia] DD/MM/YYYY');
                        const template = {
                            nome: 'usuario_cancelou_reuniao', 
                            parameters: [reuniao_encontrada.titulo, dataHoraInicio, dataHoraFim]
                        };
                        await axios(
                            templateMessage(tel.numero, template));
                        console.log("Lembrete enviado")
                    } catch (error) {
                        console.log("Não foi possível enviar o lembrete", error)
                    }
                }
            }
        } catch (error) {
            console.log(`Não foi possível notificar os participantes: ${error}`);
        }
}

export default cancelaReuniao;