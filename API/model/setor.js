var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var SetorSchema = new Schema(
    {
        descricao: { type: String, required: true },
        empresa: { type: Schema.Types.ObjectId, ref: 'Empresa', required: true }
    }
);


module.exports = mongoose.model('Setor', SetorSchema);