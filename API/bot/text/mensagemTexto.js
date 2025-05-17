import axios from "axios";
import { textMessage } from '../../utll/requestBuilder.js';
import agendaReuniao from "../operacoes/agendaReuniao.js";
import estruturaMensagemTexto from "../operacoes/estruturaMensagemTexto.js";
import cancelaReuniao from "../operacoes/cancelaReuniao.js";
import alteraHorarioReuniao from "../operacoes/alteraHorarioReuniao.js";

const mensagemTexto = async (consulta, numeroTel, mensagem, res) => {
    let checkCancelaReuniao = await cancelaReuniao(consulta, numeroTel, mensagem);

    let checkAlteraHorarioReuniao = await alteraHorarioReuniao(consulta, numeroTel, mensagem);
    
    if (!checkAlteraHorarioReuniao && !checkCancelaReuniao) {
        if (consulta.etapaFluxo === 'INICIAL') {
            const resposta = await estruturaMensagemTexto(mensagem);
            if (typeof resposta === "object" && resposta !== null) {

                const respostaString = JSON.stringify(resposta);
                try {
                    await agendaReuniao(consulta, resposta, res);
                    // await axios(textMessage(numeroTel, respostaString));
                } catch (err) {
                    console.log(err);
                    res.status(400).json({ error: 'Error sending message' + err });
                }
            } else {
                await axios(textMessage(numeroTel, resposta));
                res.status(200).json({ message: 'Message sent successfully' });
            }
        }
    }
}

export default mensagemTexto;
