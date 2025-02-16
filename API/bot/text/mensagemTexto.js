const axios = require("axios").default;
const request = require('../../utll/requestBuilder')

function estruturaMensagemTexto(texto) {
  return texto;
} 

exports.mensagemTexto = async (numeroTel, mensagem, res) => {
    const resposta = estruturaMensagemTexto(mensagem)
    try {
        await axios(request.textMessage(numeroTel, resposta + ' Reunião agendada com sucesso'))
    } catch (err) {
        res.status(400).json({ error: 'Error sending message' + err });
    }
    
}