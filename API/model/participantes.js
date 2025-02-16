import mongoose, { Schema } from 'mongoose';

var ParticipanteSchema = new Schema(
    {
        pessoa: { type: Schema.Types.ObjectId, ref: 'Pessoa', required: true },
        reuniao: { type: Schema.Types.ObjectId, ref: 'Reuniao', required: true },
        conviteAaceito: { type: Boolean, required: true, default: false },
        justificativa: { type: String, required: false }
    },
    {
        _id: false
    }
);

ParticipanteSchema.index({ pessoa: 1, reuniao: 1 }, { unique: true });

export default mongoose.model('Participante', ParticipanteSchema);
