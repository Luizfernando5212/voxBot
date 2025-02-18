import text from './text/mensagemTexto.js';

const redirecionar = {
    text: async (consulta, objetoMensagem, res) => {
        console.log(objetoMensagem)
        return await text(consulta, objetoMensagem.from, objetoMensagem.text.body, res);
    }
} 

const mensagem = async (consulta, objeto, res) =>  {
    return await redirecionar[objeto.type](consulta, objeto, res);
}

export default mensagem;