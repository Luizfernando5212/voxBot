var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ReuniaoSchema = new Schema(
    {
        titulo: { type: String, required: true },
        local: { type: String, required: false },
        pauta: { type: String, required: false },
        dataHoraInicio: { type: Date, required: true },
        dataHoraFim: { type: Date, required: true },
        status: { type: String, enum: ['Agendada', 'Realizada', 'Cancelada'], required: true, default: 'Agendada' },
        organizador: { type: Schema.Types.ObjectId, ref: 'Pessoa', required: true },
        setor: { type: Schema.Types.ObjectId, ref: 'Setor', required: false },
    }
);

module.exports = mongoose.model('Reuniao', ReuniaoSchema);