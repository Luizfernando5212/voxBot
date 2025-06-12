import Reuniao from '../../model/reuniao.js';
import participantes from '../../model/participantes.js';
import Feriado from '../../model/feriado.js';
import findWithJoinCascade from '../../utll/mongoQuery.js';
import { format } from 'date-fns-tz';
import { startOfDay, endOfDay } from 'date-fns';
import { converteParaHorarioBrasilia } from '../../utll/data.js';


import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
dayjs.extend(utc);


async function isFeriado(date, empresaId) {
    const data = converteParaHorarioBrasilia(date);
    const inicioDia = startOfDay(data);
    const fimDia = endOfDay(data);

    const feriado = await Feriado.findOne({
        empresa: empresaId,
        data: { $gte: inicioDia, $lte: fimDia },
        status: 'A', // ativo
    });

    return !!feriado;
}

async function haConflitoHorario(consulta, idReuniao, callback) {

    const reuniao = await Reuniao.findById(idReuniao);
    // const { dataHoraInicio: inicio, dataHoraFim: fim } = reuniao.toObject();
    // const { dataHoraInicio: inicioRaw, dataHoraFim: fimRaw } = reuniao.toObject();

    // const duracaoReuniao = new Date(fim) - new Date(inicio); // Duração da reunião em milissegundos
    const { dataHoraInicio: inicioRaw, dataHoraFim: fimRaw } = reuniao;

    const inicio = dayjs(inicioRaw);
    const fim = dayjs(fimRaw);

    console.log('Inicio:', inicio.format());
    console.log('Fim:', fim.format());

    const duracaoReuniao = fim.diff(inicio);


    const ehFeriado = await isFeriado(inicio, consulta.pessoa.setor.empresa._id);
    if (ehFeriado) {
        return callback(true, [], 'Data selecionada não é dia útil, escolha outro dia.');
    }

    const pessoas = await participantes.find({ reuniao: idReuniao }).select('pessoa');
    const idsParticipantes = pessoas.map((pessoa) => pessoa.pessoa);

    const expediente = {
        inicio: consulta.pessoa.setor.empresa.iniExpediente,
        fim: consulta.pessoa.setor.empresa.fimExpediente,
    }

    // let expedienteInicio = new Date(inicio);
    // expedienteInicio.setHours(0, 0, 0, 0); // Define o horário de início do expediente para 00:00:00.000
    // let expedienteFim = new Date(fim);
    // expedienteFim.setHours(23, 59, 59, 999);

    let expedienteInicio = inicio.startOf('day');
    let expedienteFim = fim.endOf('day');

    let reunioesAgendadas = await obterReunioesAgendadas(idsParticipantes, expedienteInicio.toDate(), expedienteFim.toDate());

    console.log('Reuniões agendadas:', reunioesAgendadas);

    if (reunioesAgendadas.length > 0) {
        // if (expediente.inicio && expediente.fim) {
        //     const [horaInicio, minutoInicio] = expediente.inicio.split(":");
        //     expedienteInicio = new Date(inicio);
        //     expedienteInicio.setHours(parseInt(horaInicio), parseInt(minutoInicio), 0, 0);

        //     const [horaFim, minutoFim] = expediente.fim.split(":");
        //     expedienteFim = new Date(fim);
        //     expedienteFim.setHours(parseInt(horaFim), parseInt(minutoFim), 0, 0);
        // }
        console.log('Achei reuniões')
        if (expediente.inicio && expediente.fim) {
            const [horaInicio, minutoInicio] = expediente.inicio.split(":").map(Number);
            expedienteInicio = inicio.set('hour', horaInicio).set('minute', minutoInicio).set('second', 0).set('millisecond', 0);

            const [horaFim, minutoFim] = expediente.fim.split(":").map(Number);
            expedienteFim = fim.set('hour', horaFim).set('minute', minutoFim).set('second', 0).set('millisecond', 0);
        }
        console.log('Expediente Início:', expedienteInicio.format());
        console.log('Expediente Fim:', expedienteFim.format());
        reunioesAgendadas = reunioesAgendadas.map((reuniao) => {
            return formatarReuniao(reuniao);
        });

        // const haConflito = reunioesAgendadas.some((r) => {
        //     return (
        //         (inicio >= r.dataHoraInicio && inicio < r.dataHoraFim) ||
        //         (fim > r.dataHoraInicio && fim <= r.dataHoraFim) ||
        //         (inicio <= r.dataHoraInicio && fim >= r.dataHoraFim)
        //     );
        // });
        console.log('Reuniões agendadas formatadas:', reunioesAgendadas);

        const haConflito = reunioesAgendadas.some(r => {
            const inicioReuniao = dayjs.utc(r.dataHoraInicio);
            const fimReuniao = dayjs.utc(r.dataHoraFim);

            return (
                (inicio.isSame(inicioReuniao) || inicio.isAfter(inicioReuniao)) && inicio.isBefore(fimReuniao) ||
                fim.isAfter(inicioReuniao) && (fim.isSame(fimReuniao) || fim.isBefore(fimReuniao)) ||
                inicio.isBefore(inicioReuniao) && fim.isAfter(fimReuniao)
            );
        });

        if (haConflito) {

            const intervalosLivres = calcularIntervalosLivres(expedienteInicio, expedienteFim, reunioesAgendadas);
            const sugestoesSemConflito = horariosAlternativos(intervalosLivres, duracaoReuniao);

            callback(true, sugestoesSemConflito); // Conflito de horário encontrado
        } else {
            callback(false, []); // Sem conflito de horário
        }
    } else {
        callback(false, []); // Sem reuniões agendadas
    }

}

// function formatarReuniao(reuniao) {
//     if (reuniao.dataHoraInicio) {
//         reuniao.dataHoraInicio = format(new Date(reuniao.dataHoraInicio), 'yyyy-MM-dd HH:mm:ssXXX', {
//             timeZone: 'America/Sao_Paulo'
//         });
//     }
//     if (reuniao.dataHoraFim) {
//         reuniao.dataHoraFim = format(new Date(reuniao.dataHoraFim), 'yyyy-MM-dd HH:mm:ssXXX', {
//             timeZone: 'America/Sao_Paulo'
//         });
//     }

//     return reuniao;
// }

function formatarReuniao(reuniao) {
    return {
        ...reuniao,
        dataHoraInicio: dayjs.utc(reuniao.dataHoraInicio),
        dataHoraFim: dayjs.utc(reuniao.dataHoraFim),
    };
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

    console.log('inicio:', inicio);
    console.log('fim:', fim);

    const reunioesAgendadas = participantesReunioes
        .map((participante) => participante.reuniao)
        .filter((reuniao, index, self) => {
            return index === self.findIndex((r) => r._id.toString() === reuniao._id.toString());
        })
        .sort((a, b) => new Date(a.dataHoraInicio) - new Date(b.dataHoraInicio));
    return reunioesAgendadas;
}

// function calcularIntervalosLivres(expedienteInicio, expedienteFim, reunioes) {
//     const reunioesOrdenadas = [...reunioes].sort((a, b) =>
//         new Date(a.dataHoraInicio) - new Date(b.dataHoraInicio)
//     );

//     const livres = [];
//     let inicioLivre = new Date(expedienteInicio);

//     for (const reuniao of reunioesOrdenadas) {
//         const inicioReuniao = new Date(reuniao.dataHoraInicio);
//         const fimReuniao = new Date(reuniao.dataHoraFim);

//         if (inicioReuniao > inicioLivre) {
//             // Espaço livre entre o último fim e o próximo início
//             livres.push({ inicio: new Date(inicioLivre), fim: new Date(inicioReuniao) });
//         }

//         // Atualiza o próximo início livre
//         if (fimReuniao > inicioLivre) {
//             inicioLivre = new Date(fimReuniao);
//         }
//     }
//     // Depois da última reunião, até o final do expediente
//     if (inicioLivre < expedienteFim) {
//         livres.push({ inicio: new Date(inicioLivre), fim: new Date(expedienteFim) });
//     }
//     return livres;
// }

function calcularIntervalosLivres(expedienteInicio, expedienteFim, reunioes) {
    const reunioesOrdenadas = [...reunioes].sort((a, b) => a.dataHoraInicio.diff(b.dataHoraInicio));

    const livres = [];
    let inicioLivre = expedienteInicio;

    for (const reuniao of reunioesOrdenadas) {
        const inicioReuniao = reuniao.dataHoraInicio;
        const fimReuniao = reuniao.dataHoraFim;

        if (inicioReuniao.isAfter(inicioLivre)) {
            livres.push({ inicio: inicioLivre, fim: inicioReuniao });
        }

        if (fimReuniao.isAfter(inicioLivre)) {
            inicioLivre = fimReuniao;
        }
    }

    if (inicioLivre.isBefore(expedienteFim)) {
        livres.push({ inicio: inicioLivre, fim: expedienteFim });
    }

    return livres;
}

function horariosAlternativos(intervalosLivres, duracaoReuniao, maxSugestoes = 5) {
    const sugestoes = [];

    for (const intervalo of intervalosLivres) {
        let inicioSugestao = intervalo.inicio;

        while (inicioSugestao.valueOf() + duracaoReuniao <= dayjs(intervalo.fim).valueOf()) {
            console.log('duracaoReuniao', duracaoReuniao);
            const fimSugestao = inicioSugestao.add(duracaoReuniao, 'millisecond');

            sugestoes.push({
                inicio: inicioSugestao, // mantém como dayjs para reutilizar depois
                fim: fimSugestao
            });

            if (sugestoes.length >= maxSugestoes) {
                return sugestoes;
            }
            console.log(`Sugestão de horário: ${inicioSugestao.format('DD/MM/YYYY HH:mm')} - ${fimSugestao.format('DD/MM/YYYY HH:mm')}`);
            // Avança para próxima sugestão em 30 min
            inicioSugestao = inicioSugestao.add(30, 'minute');
        }
    }
    return sugestoes;
}


export default haConflitoHorario;