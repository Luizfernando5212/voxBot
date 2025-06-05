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

        now.subtract(3, 'hours');
        now = now.toDate();

        check_10_minutes.subtract(3, 'hours');
        check_10_minutes = check_10_minutes.toDate();

        try {
            const reunioes = await reuniao.find({
                    dataHoraInicio: {
                        $gte: now,
                        $lte: check_10_minutes
                    },
                    status: "Agendada",
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
                                const template = {
                                    nome: 'lembre_reuniao', 
                                    parameters: [pessoa.nome, reuniao.titulo, dataHoraInicio]
                                };
                                await axios(templateMessage(tel.numero, template));
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

export default envioLembrete;