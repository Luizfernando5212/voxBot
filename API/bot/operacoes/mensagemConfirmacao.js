import axios from 'axios';
import Participantes from '../../model/participantes.js';
import pessoa from '../../model/pessoa.js';
import telefone from '../../model/telefone.js';
import { interactiveMessage, templateMessage } from '../../utll/requestBuilder.js';
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Método para enviar mensagem de confirmação de reunião, tanto para o organizador quanto para os participantes.
 * 
 * @param {Object} consulta - Objeto de consulta de pessoa retornado do banco de dados
 * @param {Object} reuniao - Objeto de reunião retornado do banco de dados 
 * @param {Array} listaParticipantes - Lista de participantes da reunião, parâmetro opcional
 */
const mensagemConfirmacao = async (consulta, reuniao, listaParticipantes = []) => {

    let listaSemOrganizador = [];

    if (listaParticipantes.length === 0) {
        // Buscar participantes relacionados à reunião
        const participantes = await Participantes.find({ reuniao: reuniao._id })
        .populate({ path: 'pessoa', select: 'nome _id' });
        // Extrair apenas os nomes dos participantes
        listaSemOrganizador = participantes.filter(participante => {
            return !participante.pessoa._id.equals(reuniao.organizador);
        });
    }
    
    if (reuniao.status === 'Aguardando') {

        if (listaSemOrganizador.length !== 0) {
            listaParticipantes = listaSemOrganizador.map(p => p.pessoa.nome);
        }

        consulta.etapaFluxo = 'CONFIRMACAO';
        consulta.reuniao = reuniao._id;
        // const mensagem = `Gostaria de confirmar a reunião ${reuniao.titulo} no dia ${reuniao.dataHoraInicio.toLocaleString('pt-BR')}, com: ${listaParticipantes.join(', ')} ?`;
        const mensagem = `Gostaria de confirmar a reunião ${reuniao.titulo} no dia ${dayjs(reuniao.dataHoraInicio).format('DD/MM/YYYY[,] HH:mm')}, com: ${listaParticipantes.join(', ')} ?`;
        const botoes = [{ id: 'CONFIRMAR', nome: 'Confirmar' }, { id: 'CANCELAR', nome: 'Cancelar' }];
        await axios(interactiveMessage(consulta.numero, mensagem, botoes, 1));
        await consulta.save();
    } else if (reuniao.status === 'Agendada') {
        listaParticipantes = listaSemOrganizador.map(p => p.pessoa._id);
        const organizador = await pessoa.findById(reuniao.organizador);
        const telefones = await telefone.find({ pessoa: { $in: listaParticipantes } });
        telefones.forEach(t => {
            t.reuniao = reuniao._id;
            t.save();
        });

        const numeros = telefones.map(t => t.numero);
        const data = dayjs(reuniao.dataHoraInicio).format('DD/MM/YYYY');
        const horaInicio = dayjs(reuniao.dataHoraInicio).format('HH:mm');
        const horaFim = dayjs(reuniao.dataHoraFim).format('HH:mm');
        const template = {
            nome: 'reuniao_marcado_envio',
            parameters: [organizador.nome, reuniao.titulo, data, horaInicio, horaFim]
        };

        numeros.forEach(async (numero) => {
            await axios(templateMessage(numero, template));
        })
    }
}

export default mensagemConfirmacao;