import mongoose, { Schema } from 'mongoose';

var SetorSchema = new Schema(
    {
        descricao: { type: String, required: true },
        empresa: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true }
    }
);


export default mongoose.model('Setor', SetorSchema);