var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var PessoaSchema = new Schema(
    {
        nome: { type: String, required: true },
        apelido: { type: String, },
        matricula: { type: String,  },
        setor: { type: Schema.Types.ObjectId, ref: 'Setor', required: true }
    }
);


module.exports = mongoose.model('Pessoa', PessoaSchema);