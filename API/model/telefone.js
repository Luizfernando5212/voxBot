import mongoose, { Schema } from 'mongoose';

var TelefoneSchema = new Schema(
    {
        pessoa: { type: Schema.Types.ObjectId, ref: 'Pessoa', required: true },
        codigoArea: { type: String, required: true },
        numero: { type: String, required: true, unique: true },
    }
);


export default mongoose.model('Telefone', TelefoneSchema);