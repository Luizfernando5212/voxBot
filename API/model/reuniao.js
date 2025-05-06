import mongoose, { Schema } from 'mongoose';
import { format } from 'date-fns-tz';


var ReuniaoSchema = new Schema(
    {
        titulo: { type: String, required: true },
        local: { type: String, required: false },
        pauta: { type: String, required: false },
        dataHoraInicio: { type: Date, required: true },
        dataHoraFim: { type: Date, required: true },
        status: { type: String, enum: ['Agendada', 'Aguardando', 'Realizada', 'Cancelada'], required: true, default: 'Aguardando' },
        organizador: { type: Schema.Types.ObjectId, ref: 'Pessoa', required: true },
        setor: { type: Schema.Types.ObjectId, ref: 'Setor', required: false },
        qtdDuplicados: { type: Number, required: false, default: 0 },
    },
    {
        timestamps: true,
        toJSON: {
            transform: function (doc, ret) {
                if (ret.dataHoraInicio) {
                    ret.dataHoraInicio = format(ret.dataHoraInicio, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone: 'America/Sao_Paulo' });
                }
                if (ret.dataHoraFim) {
                    ret.dataHoraFim = format(ret.dataHoraFim, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone: 'America/Sao_Paulo' });
                }
                return ret;
            }
        },
        toObject: {
            transform: function (doc, ret) {
                if (ret.dataHoraInicio) {
                    ret.dataHoraInicio = format(ret.dataHoraInicio, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone: 'America/Sao_Paulo' });
                }
                if (ret.dataHoraFim) {
                    ret.dataHoraFim = format(ret.dataHoraFim, 'yyyy-MM-dd HH:mm:ssXXX', { timeZone: 'America/Sao_Paulo' });
                }
                return ret;
            }
        }
    }
);

export default mongoose.model('Reuniao', ReuniaoSchema);0