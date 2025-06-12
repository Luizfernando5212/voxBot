import participantes from "../../model/participantes.js";
import telefones from '../../model/telefone.js';
import axios from "axios";
import { templateMessage } from '../../utll/requestBuilder.js';
import { converteParaHorarioBrasilia } from '../../utll/data.js';

import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);

/**
 * A função enviaNotificacaoReuniaoCancelada envia uma notificação de alteração de horário de reunião para os participantes.
 * 
 * @param {Object} reuniao_encontrada - Objeto que contém os dados da reunião encontrada
 * @throws {Error} - Lança um erro caso não consiga enviar a notificação
 * @returns {Promise<void>} - Promise que resolve quando a notificação é enviada
 */
async function enviaNotificacaoReuniaoCancelada(reuniao_encontrada, templateName, language = 'pt_BR') {
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

            if (tel) {
                try {
                    if (!reuniao_encontrada.dataHoraInicio || !reuniao_encontrada.dataHoraFim) {
                        console.warn("Não foi possível enviar o lembrete. A reunião está com data/hora de início ou fim ausente.");
                        return; // ou throw new Error(...)
                    }

                    console.log(reuniao_encontrada.dataHoraInicio, reuniao_encontrada.dataHoraFim);

                    const dataHoraInicio = dayjs(reuniao_encontrada.dataHoraInicio).format('HH:mm [do dia] DD/MM/YYYY');
                    const dataHoraFim = dayjs(reuniao_encontrada.dataHoraFim).format('HH:mm [do dia] DD/MM/YYYY');

                    const template = {
                        nome: templateName,
                        parameters: [reuniao_encontrada.titulo, dataHoraInicio, dataHoraFim],
                        language: language
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

export default enviaNotificacaoReuniaoCancelada;
