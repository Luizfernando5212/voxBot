import axios from 'axios';
import Participantes from '../../model/participantes.js';
import { interactiveMessage } from '../../utll/requestBuilder.js';

const mensagemConfirmacao = async (consulta, reuniao, listaParticipantes = []) => {
    if (listaParticipantes.length === 0) {
        // Buscar participantes relacionados à reunião
        const participantes = await Participantes.find({ reuniao: reuniao._id })
            .populate({ path: 'pessoa', select: 'nome _id' });
        // Extrair apenas os nomes dos participantes
        const listaSemOrganizador = participantes.filter(participante => {
            return !participante.pessoa._id.equals(reuniao.organizador);
    });
        listaParticipantes = listaSemOrganizador.map(p => p.pessoa.nome);
    }
    if (reuniao.stataus === 'Aguardando') {
        consulta.etapaFluxo = 'CONFIRMACAO';
        consulta.reuniao = reuniao._id;
        const mensagem = `Gostaria de confirmar a reunião ${reuniao.titulo} no dia ${reuniao.dataHoraInicio.toLocaleString('pt-BR')}, com: ${listaParticipantes.join(', ')} ?`;
        const botoes = [{ id: 'CONFIRMAR', nome: 'Confirmar' }, { id: 'CANCELAR', nome: 'Cancelar' }];
        await axios(interactiveMessage(consulta.numero, mensagem, botoes, 1));
        await consulta.save();
    } else {
       null;
    }
}

export default mensagemConfirmacao;