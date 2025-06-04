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
    novoHorarioInicio: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ), não deve ser convertido para UTC, mantenha o Z no final, capture exatamente como o usuário informou.'),
    novoHorarioFim: z.string().describe('formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ), apenas preencha caso esteja explícita e não deve ser convertido para UTC, mantenha o Z no final, capture exatamente como o usuário informou.'),
    indAlteracaoHorario: z.boolean().optional().describe('Deve ser true caso o usuário deseje alterar o horário de uma reunião.'),
    indMudancaDia: z.boolean().optional().describe('Deve ser true caso o usuário deseje alterar o dia de uma reunião.'),
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
            await axios(textMessage(numeroTel, 'Por gentileza, informe corretamente os horários da reunião que deseja alterar.'));
            return true;
        } else if (resultado.novoHorarioInicio == '' || resultado.novoHorarioInicio == null) {
            console.log('Usuário não informou a nova data/hora da reunião.');
            await axios(textMessage(numeroTel, 'Por gentileza, informe corretamente os horários da reunião que deseja alterar.'));
            return true;
        } else {
            try {
                const reuniao_encontrada = await updateHorarioReuniaoMongoDB(resultado, numeroTel, consulta);
                if (reuniao_encontrada === null) {
                    return true;
                }
                console.log(reuniao_encontrada);
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
 * 
 * @param {Object} resultado - Objeto que contém as informações da reunião
 * @param {String} numeroTel - Número de telefone do usuário
 * @param {Object} consulta - Objeto que contém as informações do usuário
 * @returns {Object|null} - Retorna o objeto da reunião atualizada ou null se não encontrar a reunião
 */
async function updateHorarioReuniaoMongoDB(resultado, numeroTel, consulta){
    try{
        console.log(resultado.dataHoraInicio)

        let dates = {
            dataHoraInicio: new Date(resultado.dataHoraInicio),
            novoHorarioInicio: new Date(resultado.novoHorarioInicio),
            novoHorarioFim: new Date(resultado.novoHorarioFim)
        }

        console.log(dates);

        const reuniao_encontrada = await reuniao.findOne({
            dataHoraInicio: dates.dataHoraInicio,
            status: 'Agendada',
            "organizador": consulta.pessoa._id
        })

        if (reuniao_encontrada === null) {
            await axios(textMessage(numeroTel, 'Reunião não encontrada'));
            return null;
        }

        if (reuniao_encontrada.dataHoraInicio.getTime() === dates.novoHorarioInicio.getTime() && !isNaN(dates.novoHorarioInicio.getTime()) && reuniao_encontrada.dataHoraFim.getTime() === dates.novoHorarioFim.getTime()) {
            await axios(textMessage(numeroTel, 'A reunião já possui esse horário.'));
            return null;
        }
        
        //Muda apenas o dia da dataHoraFim caso o usuário tenha alterado o dia da reunião
        if (resultado.indMudancaDia) {
            reuniao_encontrada.dataHoraFim = new Date(
                dates.novoHorarioInicio.getFullYear(),
                dates.novoHorarioInicio.getMonth(),
                dates.novoHorarioInicio.getDate(),
                reuniao_encontrada.dataHoraFim.getHours(),
                reuniao_encontrada.dataHoraFim.getMinutes(),
                reuniao_encontrada.dataHoraFim.getSeconds()  
            )
        }

        reuniao_encontrada.dataHoraInicio = dates.novoHorarioInicio
        
        if (resultado.novoHorarioFim) {
            reuniao_encontrada.dataHoraFim = dates.novoHorarioFim
        }

        if (dates.novoHorarioInicio.getTime() === reuniao_encontrada.dataHoraFim.getTime()){
            await axios(textMessage(numeroTel, 'O horário de início não pode ser igual ao horário de fim da reunião.'));
            return null;
        }
        
        const validaExitenciaReuniao = await reuniao.find({
            $or: [
                {
                    dataHoraInicio: { $lt: reuniao_encontrada.dataHoraFim },
                    dataHoraFim: { $gt: reuniao_encontrada.dataHoraInicio }
                }
            ],
            status: 'Agendada',
            "organizador": consulta.pessoa._id,
            _id: { $ne: reuniao_encontrada._id }
        })

        if (validaExitenciaReuniao.length > 0) {
            await axios(textMessage(numeroTel, 'Conflito de horário, você já possui uma reunião agendada durante esse período.'));
            return null;
        }
        
        console.log(reuniao_encontrada.dataHoraFim);
        
        return reuniao_encontrada;
    } catch (error) {
        console.error(`Erro ao atualizar o horário da reunião: ${error}`);
        return null;
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
            { role: 'system', content: 'Extraia as informações do evento, identifique horários e verifique se o usuário deseja alterar o horário de uma reunião, você deve compreender linguagens como hoje, amanhã, semana que vem e outras variações, não produza informações, hoje é dia ' + new Date() +
                ' dataHoraInicio, é uma informação obrigatória, pois se refere ao horário da reunião que está sendo buscada, não converta para UTC em hipótese nenhuma e não acrescente em hipótese nenhuma o -03:00, mantenha o Z no final.' +
                ' novoHorarioInicio é uma informação obrigatório, pois se refere ao novo horário de início para a reunião, não converta para UTC em hipótese nenhuma e não acrescente em hipótese nenhuma o -03:00, mantenha o Z no final.' +
                ' novoHorarioFim é uma informação opcional, se refere ao novo horário de fim para a reunião, não converta para UTC em hipótese nenhuma e não acrescente em hipótese nenhuma o -03:00, mantenha o Z no final.' +
                ' indAlteracaoHorario é um booleano que indica se o usuário está querendo alterar o horário de uma reunião.' +
                ' indMudancaDia é um booleano que indica se o usuário está mudando o dia da reunião e não só o horário.' },
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