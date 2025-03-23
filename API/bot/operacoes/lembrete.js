import axios from "axios";
import cron from "node-cron";
import moment from "moment-timezone";
import telefones from '../../model/telefone.js';
import reuniao from "../../model/reuniao.js";
import { textMessage } from '../../utll/requestBuilder.js';

/**
 * A função envioLembrete é responsável por enviar lembretes de reuniões agendadas em um intervalo de 10 minutos
 * 
 * @param {void} - A função não recebe parâmetros
 * 
 * @returns {void} - A função não retorna nada
 */
const envioLembrete = async () => {
    try {

        var now = moment.tz("America/Sao_Paulo");
        var check_10_minutes = moment(now).add(10, 'minutes');
        
        // Subtraindo por 3 pois o toDate() converte para UTC e o horário de Brasília é -3
        now.subtract(3, 'hours');
        now = now.toDate();

        check_10_minutes.subtract(3, 'hours');
        check_10_minutes = check_10_minutes.toDate();

        const reunioes = await reuniao.find({
            dataHoraInicio: {
                $gte: now,
                $lt: check_10_minutes
            }
        });

        if (!reunioes.length === 0){
            const telefone = await telefones.find({
                pessoa: reunioes.organizador._id
            })
            
            for (const reuniao in reunioes){
                console.log(`Envio de lembretes para ${reuniao.organizador._id}: ${reuniao.nome}`)
                
                if (reuniao.organizar._id === telefone.pessoa){
                    await axios(textMessage(telefone.numero, `Lembrete para a sua reunião das: ${reunioes.dataHoraInicio}`))
                }
            }
        }

    } catch(err) {
        console.log(err)
    }
}

cron.schedule('* * * * *', envioLembrete);