import axios from "axios";
import cron from "node-cron";
import moment from "moment-timezone";
import telefones from '../../model/telefone.js';
import reuniao from "../../model/reuniao.js";
import pessoas from "../../model/pessoa.js";
import { templateMessage } from '../../utll/requestBuilder.js';

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

        //[TODO]: Precisa ajustar esse trecho futuramente, visto que várias pessoas podem ter reuniões no mesmo horário, então precisamos passar por todas para enviar o lembrete
        const reunioes = await reuniao.find({
                dataHoraInicio: {
                    $gte: now,
                    $lte: check_10_minutes
                }
            });

        if (reunioes.length > 0) {
            const telefone = await telefones.find({
                pessoa: reunioes[0].organizador.toString()
            })
            const pessoas_encontradas = await pessoas.find({
                _id: reunioes[0].organizador.toString()
            })

            for (const reuniao in reunioes){
                console.log(`Envio de lembretes para ${reunioes[0].organizador}: ${pessoas_encontradas[0].nome}`)
                if (reunioes[0].organizador.toString() === telefone[0].pessoa.toString()){
                try {
                   const response = await axios(
                        templateMessage(telefone[0].numero
                            , buildTemplateMessageLembrete(pessoas_encontradas[0].nome, reunioes[0].titulo, reunioes[0].dataHoraInicio)
                        ));
                    console.log("Lembrete enviado")
                    } catch (error) {
                        console.log("Não foi possível enviar o lembrete", error)
                    }
                
                }
            }
        }
        return res.status(200).json({ message: 'lembrete enviado!' });
    } catch(err) {
        console.log(err)
    }
}


/**
 * 
 * @param {String} nome - Nome do usuário 
 * @param {String} titulo - Título da reunião 
 * @param {String} dataHoraInicio - Horário de início da reunião 
 */
const buildTemplateMessageLembrete = (nome, titulo, dataHoraInicio) => {
    const template = {
        name: "lembre_reuniao",
        language: {
            code: "pt_BR",
        },
        components: [{
            type: "body",
            parameters: [
                {type: "text", text: nome},
                {type: "text", text: titulo},
                {type: "text", text: dataHoraInicio}
            ]
        }]
    }
    return template;
}

// cron.schedule('* * * * *', envioLembrete);
// export default envioLembrete;

envioLembrete();