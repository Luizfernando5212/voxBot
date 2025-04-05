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
        
        // Se não encontrar ninguém, não faz nada
        if (reunioes.length === 0){
                return;
        }

        const organizadores = reunioes.map(r => r.organizador.toString());

        if (reunioes.length > 0) {
            const telefone = await telefones.find({
                pessoa: { $in: organizadores }
            }).toArray();

            const pessoas_encontradas = await pessoas.find({
                _id: { $in: organizadores }
            }).toArray();

            for (const reuniao of reunioes){
                console.log(`Envio de lembretes para ${reuniao.organizador.toString()}: ${reuniao.nome}`)

                const tel = telefone.find(t => t.pessoa.toString() === reuniao.organizador.toString());
                const pessoa = pessoas_encontradas.find(p => p._id.toString() === reuniao.organizador.toString());

                if (tel && pessoa) {

                try {
                   const response = await axios(
                        templateMessage(telefone[0].numero
                            , buildTemplateMessageLembrete(pessoa.nome, reuniao.titulo, reuniao.dataHoraInicio)
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

cron.schedule('*/10 * * * *', envioLembrete);
// export default envioLembrete;

// envioLembrete();