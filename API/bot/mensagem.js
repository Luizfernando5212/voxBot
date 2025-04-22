import text from './text/mensagemTexto.js';
import interactive from './interactive/mensagemInterativa.js';

// Objeto para redirecionar as mensagens baseado no tipo da mensagem recebida
const redirecionar = {
    text: async (consulta, objetoMensagem, res) => {
        return await text(consulta, objetoMensagem.from, objetoMensagem.text.body, res);
    },
    interactive: async (consulta, objetoMensagem, res) => {
        return await interactive(consulta, objetoMensagem.from, objetoMensagem.interactive, res);
    },
} 

/**
 * 
 * @param {Object} consulta  - Objeto de consulta de pessoa retornado do banco de dados
 * @param {Object} objeto - Objeto de mensagem retornado do webhook
 * @param {Object} res 
 * @returns 
 */
const mensagem = async (consulta, objeto, res) =>  {
    return await redirecionar[objeto.type](consulta, objeto, res);
}

export default mensagem;