import reuniao from "../../model/reuniao.js";
import telefone from "../../model/telefone.js";
import adicionaParticipante from "../operacoes/adicionaParticipante.js";
import { textMessage, interactiveMessage } from "../../utll/requestBuilder.js";
import axios from "axios";

/**
 * 
 * @param {Object} consulta - Objeto de consulta de pessoa retornado do banco de dados 
 * @param {String} numeroTel - Número de telefone do participante 
 * @param {Object} mensagem - Objeto da mensagem enviada pelo WhatsApp
 * @param {Object} res - Resposta da requisição
 * @returns {Object} - Retorna um objeto com a mensagem de sucesso ou erro
 */
const confirmarParticipante = async (consulta, numeroTel, mensagem, res) => {
    const reuniaoId = consulta.reuniao._id;
    const reuniaoAtual = await reuniao.findById(reuniaoId);

    console.log(mensagem)

    const alteraStatusReuniao = async () => {
        reuniaoAtual.status = 'Agendada';
        reuniaoAtual.save();
        const tel = await telefone.findOne({ numero: numeroTel });
        tel.reuniao = null;
        tel.save();
    }

    const callback = async (result, participante = null) => {
        if (result === 'Sucesso' && reuniaoAtual.qtdDuplicados > 0) {
            reuniaoAtual.qtdDuplicados--;
            reuniaoAtual.save();
            await axios(textMessage(numeroTel, `${mensagem.list_reply.title} adicionado com sucesso.`));
            if (reuniaoAtual.qtdDuplicados === 0) {
                alteraStatusReuniao();
                await axios(textMessage(numeroTel, 'Não há mais participantes com nomes duplicados, reunião agendada.'));
            }
            return res.status(200).json({ message: 'Participante adicionado com sucesso' });
        } else if (result === 'Duplicado') {
            await axios(textMessage(numeroTel, `${mensagem.list_reply.title} já está adicionado na reunião.`));
            return res.status(200).json({ message: 'Participante já adicionado' });
        } else {
            await axios(textMessage(numeroTel, 'Erro ao adicionar participante, tente selecionar o participante novamente, utilizando a lista enviada anteriormente.'));
            return res.status(400).json({ error: 'Erro ao adicionar participante' });
        }
    }

    if (reuniaoAtual) {
        if (reuniaoAtual.status === 'Aguardando') {
            const participante = { _id: mensagem.list_reply.id };
            if (reuniaoAtual.qtdDuplicados > 0) {
                await adicionaParticipante(participante, reuniaoAtual, callback);
            } else {
                alteraStatusReuniao();
                await axios(textMessage(numeroTel, 'Reunião já agendada, não é possível adicionar mais participantes.'));
                return res.status(400).json({ error: 'Reunião já agendada' });
            }
        } else if (reuniaoAtual.status === 'Agendada') {
            await axios(textMessage(numeroTel, 'Reunião já agendada, não é possível adicionar mais participantes.'));
            return res.status(400).json({ error: 'Reunião já agendada' });
        }
    } else {
        return res.status(400).json({ error: 'Reunião não encontrada' });
    }
}

export default confirmarParticipante;