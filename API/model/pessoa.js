import mongoose, { Schema } from 'mongoose';

var PessoaSchema = new Schema(
    {
        nome: { type: String, required: true },
        apelido: { type: String, },
        matricula: { type: String,  },
        setor: { type: Schema.Types.ObjectId, ref: 'Setor', required: true },
        email: { type: String, required: true },
    }
);


export default mongoose.model('Pessoa', PessoaSchema);