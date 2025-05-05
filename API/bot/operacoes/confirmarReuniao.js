import reuniao from "../../model/reuniao.js";
import { textMessage } from "../../utll/requestBuilder.js";
import axios from "axios";

const confirmarReuniao = async (consulta, numeroTel, mensagem, res) => {
    const reuniaoId = consulta.reuniao._id;
    const reuniaoAtual = await reuniao.findById(reuniaoId);

    console.log('cheguei');

    if (reuniaoAtual) {
        if (reuniaoAtual.status === 'Aguardando') {
            const resposta = mensagem.button_reply.id;
            if (resposta === 'CONFIRMAR') {
                reuniaoAtual.status = 'Agendada';
                consulta.etapaFluxo = 'INICIAL';
                consulta.reuniao = null;
                consulta.save();
                await reuniaoAtual.save();
                await axios(textMessage(numeroTel, `Reunião agendada com sucesso para ${reuniaoAtual.dataHoraInicio.toLocaleString('pt-BR')} até ${reuniaoAtual.dataHoraFim.toLocaleString('pt-BR')}.`));

            } else if (resposta === 'CANCELAR') {
                consulta.etapaFluxo = 'INICIAL';
                consulta.reuniao = null;
                consulta.save();
                await axios(textMessage(numeroTel, 'Reunião cancelada.'));
            }
            res.status(200).json({ message: 'Reunião confirmada ou cancelada com sucesso' });
        } else {
            await axios(textMessage(numeroTel, 'Reunião já agendada ou cancelada.'));
            return res.status(400).json({ error: 'Reunião já agendada ou cancelada' });
        }
    } else {
        res.status(400).json({ error: 'Reunião não encontrada' });
    }
    return null;
}

export default confirmarReuniao;