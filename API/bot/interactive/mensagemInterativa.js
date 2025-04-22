import confirmarParticipante from "../operacoes/confirmarParticipante.js";

const mensagemInterativa = async (consulta, numeroTel, mensagem, res) => {
    if (consulta.reuniao) {
        confirmarParticipante(consulta, numeroTel, mensagem, res);
    }
}

export default mensagemInterativa;