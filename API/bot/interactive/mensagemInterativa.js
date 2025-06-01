import confirmarParticipante from "../operacoes/confirmarParticipante.js";
import confirmarHorario from "../operacoes/confirmarHorario.js";
import confirmarReuniao from "../operacoes/confirmarReuniao.js";

const redirecionar = {
    list_reply: async (consulta, numeroTel, mensagem, res) => {
        if(consulta.etapaFluxo === 'PESSOA_DUPLICADA') {
            return await confirmarParticipante(consulta, numeroTel, mensagem, res);
        } else if (consulta.etapaFluxo === 'CONFLITO_HORARIO') {
            return await confirmarHorario(consulta, numeroTel, mensagem, res);
        }
    },
    button_reply: async (consulta, numeroTel, mensagem, res) => {
        return await confirmarReuniao(consulta, numeroTel, mensagem, res);
    },
    button: async (consulta, numeroTel, mensagem, res) => {
        return await confirmarReuniao(consulta, numeroTel, mensagem.button, res);
    }
}

const mensagemInterativa = async (consulta, numeroTel, mensagem, res) => {
    console.log(mensagem.button.payload)
    redirecionar[mensagem.type](consulta, numeroTel, mensagem, res);
}

export default mensagemInterativa;