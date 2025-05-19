import reuniao from "../../model/reuniao.js";
import Participantes from "../../model/participantes.js";
import adicionaParticipante from "./adicionaParticipante.js";
import mensagemConfirmacao from "./mensagemConfirmacao.js";
import { textMessage, interactiveMessage, interactiveListMessage } from "../../utll/requestBuilder.js";
import { format } from "date-fns-tz";
import { ptBR } from 'date-fns/locale';
import haConflitoHorario from './verificaDisponibilidade.js';
import axios from "axios";


/**
 * 
 * @param {Object} consulta - Objeto de consulta de pessoa retornado do banco de dados 
 * @param {String} numeroTel - Número de telefone do participante 
 * @param {Object} mensagem - Objeto da mensagem enviada pelo WhatsApp
 * @param {Object} res - Resposta da requisição
 * @returns {Object} - Retorna um objeto com a mensagem de sucesso ou erro
 */
const confirmarParticipante = async (consulta, numeroTel, mensagem, res) => {
    const reuniaoId = consulta.reuniao._id;
    const reuniaoAtual = await reuniao.findById(reuniaoId);

    const callback = async (result, participante = null) => {
        if (result === 'Sucesso' && reuniaoAtual.qtdDuplicados > 0) {
            reuniaoAtual.qtdDuplicados--;
            reuniaoAtual.save();
            await axios(textMessage(numeroTel, `${mensagem.list_reply.title} adicionado com sucesso.`));
            if (reuniaoAtual.qtdDuplicados === 0) {
                // Não há mais participantes com nomes duplicados, verificamos se há conflito de horário
                const enviaSugestoes = async (haConflito, sugestoes) => {
                    if (haConflito) {
                        consulta.etapaFluxo = 'CONFLITO_HORARIO';
                        consulta.save();
                        let mensagemSugestoes = `A reunião está em conflito com outros compromissos. Aqui estão algumas sugestões de horários alternativos no mesmo dia:`;
                        let listaSugestoesHorarios = sugestoes.map(sugestao => {
                            const horaInicio = format(sugestao.inicio, 'HH:mm', { locale: ptBR });
                            const horaFim = format(sugestao.fim, 'HH:mm', { locale: ptBR });
                            return {
                                id: `${sugestao.inicio} - ${sugestao.fim}`,
                                nome: `${horaInicio} - ${horaFim}`
                            };
                        });
                        axios(interactiveListMessage(consulta.numero, mensagemSugestoes, listaSugestoesHorarios, 'Sugestões de horário'));
                    } else {
                        mensagemConfirmacao(consulta, reuniaoAtual);
                    }
                }
                await haConflitoHorario(consulta, reuniaoId, enviaSugestoes);
            }
            return res.status(200).json({ message: 'Participante adicionado com sucesso' });
        } else if (result === 'Duplicado') {
            await axios(textMessage(numeroTel, `${mensagem.list_reply.title} já está adicionado na reunião.`));
            return res.status(200).json({ message: 'Participante já adicionado' });
        } else {
            await axios(textMessage(numeroTel, 'Erro ao adicionar participante, tente selecionar o participante novamente, utilizando a lista enviada anteriormente.'));
            return res.status(400).json({ error: 'Erro ao adicionar participante' });
        }
    }

    if (reuniaoAtual) {
        if (reuniaoAtual.status === 'Aguardando') {
            const participante = { _id: mensagem.list_reply.id };
            if (reuniaoAtual.qtdDuplicados > 0) {
                await adicionaParticipante(participante, reuniaoAtual, callback);
            } else {
                mensagemConfirmacao(consulta, reuniaoAtual);
                return res.status(400).json({ error: 'Reunião já agendada' });
            }
        } else if (reuniaoAtual.status === 'Agendada') {
            await axios(textMessage(numeroTel, 'Reunião já agendada, não é possível adicionar mais participantes.'));
            return res.status(400).json({ error: 'Reunião já agendada' });
        }
    } else {
        return res.status(400).json({ error: 'Reunião não encontrada' });
    }
}

export default confirmarParticipante;