import Reuniao from '../../model/reuniao.js';
import participantes from '../../model/participantes.js';
import findWithJoinCascade from '../../utll/mongoQuery.js';
import { format } from 'date-fns-tz';


async function haConflitoHorario(consulta, idReuniao, callback) {

    const reuniao = await Reuniao.findById(idReuniao);
    const { dataHoraInicio: inicio, dataHoraFim: fim } = reuniao.toObject();
    const duracaoReuniao = new Date(fim) - new Date(inicio); // Duração da reunião em milissegundos

    const pessoas = await participantes.find({ reuniao: idReuniao }).select('pessoa');
    const idsParticipantes = pessoas.map((pessoa) => pessoa.pessoa);

    const expediente = {
        inicio: consulta.pessoa.setor.empresa.iniExpediente,
        fim: consulta.pessoa.setor.empresa.fimExpediente,
    }

    let expedienteInicio = new Date(inicio);
    expedienteInicio.setHours(0, 0, 0, 0); // Define o horário de início do expediente para 00:00:00.000
    let expedienteFim = new Date(fim);
    expedienteFim.setHours(23, 59, 59, 999);

    const reunioesAgendadas = await obterReunioesAgendadas(idsParticipantes, expedienteInicio, expedienteFim);

    if (expediente.inicio && expediente.fim) {
        const [horaInicio, minutoInicio] = expediente.inicio.split(":");
        expedienteInicio = new Date(inicio);
        expedienteInicio.setHours(parseInt(horaInicio), parseInt(minutoInicio), 0, 0);

        const [horaFim, minutoFim] = expediente.fim.split(":");
        expedienteFim = new Date(fim);
        expedienteFim.setHours(parseInt(horaFim), parseInt(minutoFim), 0, 0);
    }

    const haConflito = reunioesAgendadas.some((r) => {
        const novaReuniao = formatarReuniao(r);
        const inicioR = novaReuniao.dataHoraInicio;
        const fimR = novaReuniao.dataHoraFim;

        return (
            (inicio >= inicioR && inicio < fimR) ||
            (fim > inicioR && fim <= fimR) ||
            (inicio <= inicioR && fim >= fimR)
        );
    });

    if (haConflito) {

        const intervalosLivres = calcularIntervalosLivres(expedienteInicio, expedienteFim, reunioesAgendadas);
        const sugestoesSemConflito = horariosAlternativos(intervalosLivres, duracaoReuniao);

        callback(true, sugestoesSemConflito); // Conflito de horário encontrado
    } else {
        callback(false, []); // Sem conflito de horário
    }
}

function formatarReuniao(reuniao) {
    if (reuniao.dataHoraInicio) {
        reuniao.dataHoraInicio = format(new Date(reuniao.dataHoraInicio), 'yyyy-MM-dd HH:mm:ssXXX', {
            timeZone: 'America/Sao_Paulo'
        });
    }
    if (reuniao.dataHoraFim) {
        reuniao.dataHoraFim = format(new Date(reuniao.dataHoraFim), 'yyyy-MM-dd HH:mm:ssXXX', {
            timeZone: 'America/Sao_Paulo'
        });
    }

    return reuniao;
}

function formatarData(data) {
    return format(new Date(data), 'yyyy-MM-dd HH:mm:ssXXX', { timeZone: 'America/Sao_Paulo' });
}


async function obterReunioesAgendadas(idsParticipantes, inicio, fim) {
    const participantesReunioes = await findWithJoinCascade({
        model: participantes,
        joins: [
            { from: 'reuniaos', localField: 'reuniao', as: 'reuniao' },
        ],
        conditions: [
            { pessoa: { $in: idsParticipantes } },
            { 'reuniao.dataHoraInicio': { $gte: inicio, $lt: fim } },
            { 'reuniao.status': 'Agendada' },
        ],
        convertDates: ['reuniao.dataHoraInicio', 'reuniao.dataHoraFim'],
        project: { 'reuniao._id': 1, 'reuniao.dataHoraInicio': 1, 'reuniao.dataHoraFim': 1 },
    });

    const reunioesAgendadas = participantesReunioes
        .map((participante) => participante.reuniao)
        .filter((reuniao, index, self) => {
            return index === self.findIndex((r) => r._id.toString() === reuniao._id.toString());
        })
        .sort((a, b) => new Date(a.dataHoraInicio) - new Date(b.dataHoraInicio));
    return reunioesAgendadas;
}

function calcularIntervalosLivres(expedienteInicio, expedienteFim, reunioesOrdenadas) {
    const livres = [];
    let inicioLivre = new Date(expedienteInicio);

    for (const reuniao of reunioesOrdenadas) {
        const inicioReuniao = new Date(reuniao.dataHoraInicio);
        const fimReuniao = new Date(reuniao.dataHoraFim);

        if (inicioReuniao > inicioLivre) {
            // Espaço livre entre o último fim e o próximo início
            livres.push({ inicio: new Date(inicioLivre), fim: new Date(inicioReuniao) });
        }

        // Atualiza o próximo início livre
        if (fimReuniao > inicioLivre) {
            inicioLivre = new Date(fimReuniao);
        }
    }
    // Depois da última reunião, até o final do expediente
    if (inicioLivre < expedienteFim) {
        livres.push({ inicio: new Date(inicioLivre), fim: new Date(expedienteFim) });
    }
    return livres;
}

function horariosAlternativos(intervalosLivres, duracaoReuniao, maxSugestoes = 5) {
    const sugestoes = [];

    for (const intervalo of intervalosLivres) {
        let inicioSugestao = new Date(intervalo.inicio);

        while (inicioSugestao.getTime() + duracaoReuniao <= intervalo.fim.getTime()) {
            const fimSugestao = new Date(inicioSugestao.getTime() + duracaoReuniao);

            sugestoes.push({ inicio: formatarData(new Date(inicioSugestao)), fim: formatarData(fimSugestao) });

            if (sugestoes.length >= maxSugestoes) {
                return sugestoes;
            }
            // Avança para próxima sugestão em 30 min
            inicioSugestao = new Date(inicioSugestao.getTime() + 30 * 60 * 1000);
        }
    }
    return sugestoes;
}


export default haConflitoHorario;