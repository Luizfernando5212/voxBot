import axios from "axios";
import moment from "moment-timezone";
import telefones from '../../model/telefone.js';
import reuniao from "../../model/reuniao.js";
import pessoa from "../../model/pessoa.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { templateMessage } from '../../utll/requestBuilder.js';
import participantes from "../../model/participantes.js";
dayjs.extend(utc);

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

        try {
            const reunioes = await reuniao.find({
                    dataHoraInicio: {
                        $gte: now,
                        $lte: check_10_minutes
                    }
                });

            if (reunioes.length > 0) {
                const id_reuniao = reunioes.map(r => r._id.toString());

                const parcitipante = await participantes.find({
                    reuniao: { $in: id_reuniao },
                    conviteAceito: true
                });

                const id_pessoa = parcitipante.map(p => p.pessoa.toString());

                const telefone = await telefones.find({
                    pessoa: { $in: id_pessoa }
                })

                const pessoas = await pessoa.find({
                        _id: { $in: id_pessoa }
                    })
                                
                for (const reuniao of reunioes){

                    for (const participante of parcitipante) {
                        
                        const tel = telefone.find(t => t.pessoa.toString() === participante.pessoa.toString());
                        const pessoa = pessoas.find(p => p._id.toString() === participante.pessoa.toString());	

                        if (tel && pessoa){
                            console.log(`Tentativa de envio de lembretes para ${tel.numero}, ${pessoa.nome}`)

                            const dataHoraInicio = dayjs.utc(reuniao.dataHoraInicio).format('HH:mm [do dia] DD/MM/YYYY');

                            try {
                                const response = await axios(
                                    templateMessage(tel.numero
                                    , buildTemplateMessageLembrete(pessoa.nome, reuniao.titulo, dataHoraInicio)
                                    ));
                                console.log("Lembrete enviado")
                            } catch (error) {
                                console.log("Não foi possível enviar o lembrete", error)
                            }
                        }            
                    }
                }
            }
        } catch (error) {
            console.log("Não encontrou a informação", error)
            return;
        }
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

export default envioLembrete;

// envioLembrete();