import confirmarParticipante from "../operacoes/confirmarParticipante.js";

const redirecionar = {
    list_reply: async (consulta, numeroTel, mensagem, res) => {
        return await confirmarParticipante(consulta, numeroTel, mensagem, res);
    },
    button: async (consulta, numeroTel, mensagem, res) => {
        return await confirmarParticipante(consulta, numeroTel, mensagem, res);
    },
}

const mensagemInterativa = async (consulta, numeroTel, mensagem, res) => {
    redirecionar[mensagem.type](consulta, numeroTel, mensagem, res);
}

export default mensagemInterativa;