const text = require('./text/mensagemTexto');


const redirecionar = {
    text: async (objetoMensagem, res) => {
        return await text.mensagemTexto(objetoMensagem.from, objetoMensagem.body, res);
    }
} 

exports.mensagem = async (objeto, res) =>  {
    return await redirecionar[objeto.type](objeto, res);
}