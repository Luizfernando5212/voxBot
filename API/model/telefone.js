var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var TelefoneSchema = new Schema(
    {
        pessoa: { type: Schema.Types.ObjectId, ref: 'Pessoa', required: true },
        codigoArea: { type: String, required: true },
        numero: { type: String, required: true }
    }
);


module.exports = mongoose.model('Telefone', TelefoneSchema);