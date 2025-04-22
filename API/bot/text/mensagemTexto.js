import axios from "axios";
import { textMessage } from '../../utll/requestBuilder.js';
import agendaReuniao from "../operacoes/agendaReuniao.js";
import estruturaMensagemTexto from "../operacoes/estruturaMensagemTexto.js";

const mensagemTexto = async (consulta, numeroTel, mensagem, res) => {
    if (consulta.etapaFluxo === 'inicial') {
        const resposta = await estruturaMensagemTexto(mensagem);
        if (typeof resposta === "object" && resposta !== null) {
            const respostaString = JSON.stringify(resposta);
            try {
                await agendaReuniao(consulta, resposta, res);
                await axios(textMessage(numeroTel, respostaString));
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

export default mensagemTexto;
