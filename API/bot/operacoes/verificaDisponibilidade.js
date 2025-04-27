import reuniao from '../../model/reuniao.js';
import participantes from '../../model/participantes.js';

import conn from './connection/db.js';

conn().then(() => {
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
});

async function haConflitpHorario(objReuniao) {
    const { dataHoraInicio, dataHoraFim } = objReuniao; // Desestruturação do objeto de reunião
    const idsParticipantes = participantes.find({ _id: objReuniao._id }).projection({ participanteId: 1 }).toArray(); // Obtém os IDs dos participantes

    // Verifica se já existe uma reunião agendada no mesmo horário
    const conflitos = await Reuniao.find({
        dataHoraInicio: { $lt: dataHoraFim },
        dataHoraFim: { $gt: dataHoraInicio },
        'participantes.participanteId': { $in: idsParticipantes },
        'participantes.vaiParticipar': true
    });

    return !!reuniaoExistente; // Retorna true se houver conflito, false caso contrário
}
