import mongoose, { Schema } from 'mongoose';

var MensagemSchema = new Schema(
    {
        texto: { type: String, required: true },
        data: { type: Date, required: true, default: Date.now },
        remetente: { type: Schema.Types.ObjectId, ref: 'Telefone', required: true }
    }
);

export default mongoose.model('Mensagem', MensagemSchema);