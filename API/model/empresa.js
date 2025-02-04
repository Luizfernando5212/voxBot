var mongoose = require('mongoose');
var Schema = mongoose.Schema;



var EmpresaSchema = new Schema(
    {
        cnpj: { type: String, trim: true, index: {
            unique: true,
            partialFilterExpression: {cnpj: {$type: "string"}}
        } },
        razaoSocial: { type: String, required: true },
        qtdFuncionarios: { type: Number, required: true, default: 0 },
        status: { type: String, enum: ['A', 'I'], required: true, default: 'I' },
        dataIniCompetencia: { type: Date, required: true, default: Date.now },
        dataFimCompetencia: { type: Date, required: true, default: Date.now },
        iniExpediente: { type: String, required: false },
        fimExpediente: { type: String, required: false },
    }
);


module.exports = mongoose.model('Empresa', EmpresaSchema);