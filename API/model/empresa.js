var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var EmpresaSchema = new Schema(
    {
        cnpj: { type: String, trim: true, index: {
            unique: true,
            partialFilterExpression: {cnpj: {$type: "string"}}
        } },
        razaoSocial: { type: String, required: true },
        qtdFuncionarios: { type: Number, required: true, default: 0 }
    }
);


module.exports = mongoose.model('Empresa', EmpresaSchema);