import Reuniao from '../../model/reuniao.js';
import Pessoa from '../../model/pessoa.js';
import adicionaParticipante from './adicionaParticipante.js';
import { textMessage, interactiveListMessage, interactiveMessage } from '../../utll/requestBuilder.js';
import axios from 'axios';
import findWithJoinCascade from '../../utll/mongoQuery.js';
import haConflitoHorario from './verificaDisponibilidade.js';
import mensagemConfirmacao from './mensagemConfirmacao.js';
import { format } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

/**
 * 
 * @param {Object} consulta - Objeto de consulta de pessoa retornado do banco de dados
 * @param {Object} objReuniao - Objeto de reunião estruturado
 * @param {Object} res 
 * @returns 
 */
const agendaReuniao = async (consulta, objReuniao, res) => {
    objReuniao.organizador = consulta.pessoa._id;
    const novaReuniao = await Reuniao.create(objReuniao);
    let nomes = objReuniao.participantes;
    const setor = objReuniao.setor;

    const notificaParticipante = async (result, participante) => {
        if (result === 'Sucesso') {
            const mensagem = `Olá ${participante.pessoa.nome}, você foi convidado para a reunião ${novaReuniao.titulo} no dia ${novaReuniao.dataHoraInicio}.`;
            if (objReuniao.organizador !== participante._id) {
                try {
                    await axios(textMessage(participante.numero, mensagem));
                } catch (error) {
                    console.error('Erro ao enviar mensagem:');
                }
            }
            console.log('Participante adicionado com sucesso:', participante.pessoa.nome);
        } else {
            console.log('Erro ao adicionar participante:', participante.pessoa.nome);
        }
    }
    try {
        // adicionando o organizador da reunião
        await adicionaParticipante(consulta.pessoa, novaReuniao, notificaParticipante);
    } catch (error) {
        console.log('Erro ao adicionar organizador:', error);
        return res.status(400).json({ error: 'Erro ao adicionar organizador' });
    }

    try {
        if (nomes.length === 0 && setor !== null) {
            participantes = await Pessoa.find({ setor: setor });
            if (participantes.length === 0) {
                console.log('Nenhum participante encontrado para o setor:', setor);
                return;
            }
            participantes.forEach(async (participante) => {
                await adicionaParticipante(participante, novaReuniao, notificaParticipante);
            });
        } else {
            let naoEncontrados = [];
            let listaParticipantes = [];
            let qtdDuplicados = 0;
            for (const nome of nomes) {
                let participanteDoc = await findWithJoinCascade({
                    model: Pessoa,
                    joins: [
                        { from: 'setors', localField: 'setor', as: 'setor' },
                        { from: 'empresas', localField: 'setor.empresa', as: 'empresa' },
                    ],
                    conditions: [
                        { nome: { $regex: `${nome}`, $options: 'i' } },
                        { 'empresa._id': consulta.pessoa.setor.empresa._id }
                    ],
                    project: { _id: 1, nome: 1, 'setor.descricao': 1 }
                });
                if (participanteDoc.length === 1) {
                    listaParticipantes.push(nome);
                    await adicionaParticipante(participanteDoc[0], novaReuniao, notificaParticipante);
                } else if (participanteDoc.length > 1) {
                    // Enviar lista de pessoas com o mesmo nome para o usuário escolher
                    let participantesDuplicados = participanteDoc.map(p => ({
                        nome: `${p.nome} - ${p.setor.descricao}`,
                        id: p._id.toString()
                    }));
                    let mensagem = `Encontramos mais de uma pessoa com o nome ${nome}. Por favor, escolha uma das opções`;
                    await axios(interactiveListMessage(consulta.numero, mensagem, participantesDuplicados, 'Pessoas'));
                    qtdDuplicados++;
                } else {
                    // Participante não encontrado, nesse caso mandar mensagem para o usuário
                    naoEncontrados.push(nome);
                }
            };
            if (naoEncontrados.length > 0) {
                let mensagemNaoEncontrados = `As seguintes pessoas não foram encontradas: ${naoEncontrados.join(', ')}.`;
                await axios(textMessage(consulta.numero, mensagemNaoEncontrados));
                await axios(textMessage(consulta.numero, 'Verifique o(s) nome(s) ou consulte o administrador e tente novamente.'));
            } else if (qtdDuplicados > 0) {
                // Atualizar qtdDuplicados na reunião
                novaReuniao.qtdDuplicados = qtdDuplicados;
                await novaReuniao.save();
                consulta.reuniao = novaReuniao._id;
                consulta.etapaFluxo = 'PESSOA_DUPLICADA';
                await consulta.save();
            } else {
                // Validar se todos os participantes possuem disponibilidade
                const enviaSugestoes = async (haConflito, sugestoes) => {
                    if (haConflito) {
                        let mensagemSugestoes = `A reunião está em conflito com outros compromissos. Aqui estão algumas sugestões de horários alternativos no mesmo dia:`;
                        let listaSugestoesHorarios = sugestoes.map(sugestao => {
                            const horaInicio = format(sugestao.inicio, 'HH:mm', { locale: ptBR });
                            const horaFim = format(sugestao.fim, 'HH:mm', { locale: ptBR });
                            return {
                                id: `${sugestao.inicio} - ${sugestao.fim}`,
                                nome: `${horaInicio} - ${horaFim}`
                            };
                        });
                        await axios(interactiveListMessage(consulta.numero, mensagemSugestoes, listaSugestoesHorarios, 'Sugestões de horário'));
                    
                        consulta.etapaFluxo = 'CONFLITO_HORARIO';
                        consulta.reuniao = novaReuniao._id;
                        await consulta.save();
                    } else {
                        mensagemConfirmacao(consulta, novaReuniao, listaParticipantes);
                    }
                }

                await haConflitoHorario(consulta, novaReuniao._id, enviaSugestoes);
            }
        }

        return res.status(200).json({ message: 'Reunião agendada com sucesso!' });
    } catch (error) {
        console.log(error);
        return res.status(400).json({ error: error });
    }
}

export default agendaReuniao;
