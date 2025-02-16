import text from './text/mensagemTexto.js';

const redirecionar = {
    text: async (consulta, objetoMensagem, res) => {
        console.log(objetoMensagem)
        return await text.mensagemTexto(consulta, objetoMensagem.from, objetoMensagem.body, res);
    }
} 

exports.mensagem = async (consulta, objeto, res) =>  {
    return await redirecionar[objeto.type](consulta, objeto, res);
}