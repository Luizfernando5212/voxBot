import reuniao from "../../model/reuniao.js";
import { textMessage } from "../../utll/requestBuilder.js";
import mensagemConfirmacao from "./mensagemConfirmacao.js";


const confirmarHorario = async (consulta, numeroTel, mensagem, res) => {
    const reuniaoId = consulta.reuniao._id;
    const reuniaoAtual = await reuniao.findById(reuniaoId);

    console.log('reuniaoAtual', reuniaoAtual);
    if (reuniaoAtual) {
        if (reuniaoAtual.status === 'Aguardando') {
            const horario = mensagem.list_reply.id.split(' - ');
            const horaInicio = new Date(horario[0]);
            const horaFim = new Date(horario[1]);
            console.log(horario)
            console.log(horaInicio, horaFim);
            reuniaoAtual.dataHoraInicio = horaInicio;
            reuniaoAtual.dataHoraFim = horaFim;
            await reuniaoAtual.save();
            mensagemConfirmacao(consulta, reuniaoAtual);
            res.status(200).json({ message: 'Horário alterado com sucesso!' });
        } else {
            await axios(textMessage(numeroTel, 'Reunião já agendada, não é possível alterar o horário.'));
            return res.status(400).json({ error: 'Reunião já agendada' });
        }
    } else {
        await axios(textMessage(numeroTel, 'Reunião não encontrada.'));
        
    }
    return null;
}

export default confirmarHorario;