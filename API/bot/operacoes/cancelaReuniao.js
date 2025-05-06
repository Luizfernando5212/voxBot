import reuniao from "../../model/reuniao.js";
import axios from "axios";

async function cancelaReuniao(consulta, numeroTel, resposta) {
    if (resposta.titulo === '' && resposta.dataHoraInicio === '') {
        console.log('Usuário não informou o título e a data/hora da reunião.');
        await axios(textMessage(numeroTel, 'Informe o título e a data/hora da reunião que deseja cancelar.'));
    } else {
        console.log(resposta.titulo, resposta.dataHoraInicio)
        const reuniao_encontrada = await reuniao.findOne({
            titulo: resposta.titulo,
            dataHoraInicio: resposta.dataHoraInicio,
            status: 'Agendada',
            "organizador": consulta.pessoa._id
        })

        if (reuniao_encontrada === null) {
            console.log('Reunião não encontrada ou já cancelada.');
            await axios(textMessage(numeroTel, 'Reunião não encontrada ou já cancelada.'));
            return;
        }

        console.log(reuniao_encontrada)
        reuniao_encontrada.status = 'Cancelada';
        await reuniao_encontrada.save()
    }
}

export default cancelaReuniao;