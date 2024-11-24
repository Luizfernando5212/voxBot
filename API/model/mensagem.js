var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MensagemSchema = new Schema(
    {
        texto: { type: String, required: true },
        data: { type: Date, required: true, default: Date.now },
        remetente: { type: Schema.Types.ObjectId, ref: 'Telefone', required: true }
    }
);

module.exports = mongoose.model('Mensagem', MensagemSchema);