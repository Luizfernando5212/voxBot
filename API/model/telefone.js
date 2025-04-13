import mongoose, { Schema } from 'mongoose';

var TelefoneSchema = new Schema(
    {
        pessoa: { type: Schema.Types.ObjectId, ref: 'Pessoa', required: true },
        codigoArea: { type: String, required: true },
        numero: { type: String, required: true, unique: true },
        etapaFluxo: { type: String, required: true, default: 'inicial' },
        reuniao: { type: Schema.Types.ObjectId, ref: 'Reuniao' },
    }
);


export default mongoose.model('Telefone', TelefoneSchema);