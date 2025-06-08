import mongoose, { Schema } from 'mongoose';

const FeriadoSchema = new Schema({
    data: { type: Date, required: true, unique: false },
    descricao: { type: String, required: true },
    tipo: { type: String, enum: ['N', 'F'], default: 'N' }, // N - Nacional, F - Feriado
    status: { type: String, enum: ['A', 'I'], default: 'A' }, // A - Ativo, I - Inativo
    empresa: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true },
}, {
    timestamps: true
});

const Feriado = mongoose.model('Feriado', FeriadoSchema);
export default Feriado;