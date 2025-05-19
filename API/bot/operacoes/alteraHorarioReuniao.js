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
    dataHoraInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)'),
    novoHorarioInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)'),
    novoHorarioFim: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)'),
    indAlteracaoHorario: z.boolean().optional().describe('Deve ser true caso o usuário deseje alterar o horário de uma reunião.'),
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
async function alteraHorarioReuniao(consulta, numeroTel, texto){
    try {
        let resultado = await promptAlteracaoHorario(texto);
        if (!resultado.indAlteracaoHorario) {
            console.log("Não quer alterar o horário")
            return false;
        } else if (resultado.dataHoraInicio === '') {
            console.log('Usuário não informou a data/hora da reunião.');
            await axios(textMessage(numeroTel, 'Informe a data/hora da reunião que deseja alterar o horário.'));
            return true;
        } else if (resultado.novoHorarioInicio == '' || resultado.novoHorarioFim == '') {
            console.log('Usuário não informou a nova data/hora da reunião.');
            await axios(textMessage(numeroTel, 'Verifique se informou corretamente os novos horários para a reunião.'));
            return true;
        } else {
            try {
                let dates = {
                    novoHorarioInicio: new Date(resultado.novoHorarioInicio),
                    novoHorarioFim: new Date(resultado.novoHorarioFim)
                }

                const reuniao_encontrada = await reuniao.findOne({
                    dataHoraInicio: dates.novoHorarioInicio,
                    status: 'Agendada',
                    "organizador": consulta.pessoa._id
                })

                if (reuniao_encontrada === null) {
                    console.log('Reunião não encontrada ou cancelada');
                    return true;
                }

                if (reuniao_encontrada.dataHoraInicio.getTime() === dates.novoHorarioInicio.getTime() && reuniao_encontrada.dataHoraFim.getTime() === dates.novoHorarioFim.getTime()) {
                    console.log('A reunião já possui esse horário.')
                    return true;
                }

                reuniao_encontrada.dataHoraInicio = resultado.novoHorarioInicio
                reuniao_encontrada.dataHoraFim = resultado.novoHorarioFim
                consulta.etapaFluxo = 'INICIAL';
                consulta.reuniao = null;

                await reuniao_encontrada.save()
                await consulta.save();
                await enviaNotificacaoAlteracaoHorario(reuniao_encontrada);
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
 * Função que constrói o prompt para o OpenAI, com as informações necessárias para alterar o horário da reunião.
 * 
 * @param {String} texto - Mensagem recebida do usuário
 * @returns {Object} - Objeto com as informações extraídas do texto
 */
async function promptAlteracaoHorario(texto) {
    let responseFormat = zodResponseFormat(Evento, 'evento');
    const reuniao_alterada = await openai.beta.chat.completions.parse({
        model: 'gpt-4o-mini-2024-07-18',
        messages: [
            { role: 'system', content: 'Extraia as informações do evento e verifique se o usuário deseja alterar o horário de uma reunião, não produza informações.' +
                ' dataHoraInicio, é uma informação obrigatória, mantenha o horário informado pelo usuário sempre com o Z no final.' +
                ' novoHorarioInicio é uma informação obrigatório, pois se refere ao novo horário de início para a reunião, mantenha o horário informado pelo usuário sempre com o Z no final.' +
                ' novoHorarioFim é uma informação obrigatório, pois se refere ao novo horário de fim para a reunião, mantenha o horário informado pelo usuário sempre com o Z no final.' +
                ' indCancelamento é um booleano que indica se o usuário está querendo cancelar uma reunião.' },
            { role: 'user', content: texto },
        ],
        response_format: responseFormat,
    });
    let resultado = reuniao_alterada.choices[0].message.parsed;
    return resultado;
}


/**
 * A função enviaNotificacaoAlteracaoHorario envia uma notificação de alteração de horário de reunião para os participantes.
 * 
 * @param {Object} reuniao_encontrada - Objeto que contém os dados da reunião encontrada
 * @throws {Error} - Lança um erro caso não consiga enviar a notificação
 * @returns {Promise<void>} - Promise que resolve quando a notificação é enviada
 */
async function enviaNotificacaoAlteracaoHorario(reuniao_encontrada) {
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
                        nome: 'usuario_alterou_horario_reuniao', 
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

export default alteraHorarioReuniao;