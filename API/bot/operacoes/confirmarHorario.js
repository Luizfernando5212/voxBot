import reuniao from "../../model/reuniao.js";
import telefone from "../../model/telefone.js";


const confirmarHorario = async (consulta, numeroTel, mensagem, res) => {
    const reuniaoId = consulta.reuniao._id;
    const reuniaoAtual = await reuniao.findById(reuniaoId);

    if (reuniaoAtual) {
        if (reuniaoAtual.status === 'Aguardando') {
            const horario = mensagem.list_reply.id.split(' - ');
            const horaInicio = new Date(horario[0]);
            const horaFim = new Date(horario[1]);
            reuniaoAtual.dataHoraInicio = horaInicio;
            reuniaoAtual.dataHoraFim = horaFim;
            reuniaoAtual.status = 'Agendada';
            consulta.etapaFluxo = 'INICIAL';
            consulta.reuniao = null;
            consulta.save();
            await reuniaoAtual.save();
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