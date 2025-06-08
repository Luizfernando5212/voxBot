import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

const SALT_WORK_FACTOR = 10;

var EmpresaSchema = new Schema(
    {
        cnpj: { type: String, trim: true, index: {
            unique: true,
            partialFilterExpression: {cnpj: {$type: "string"}}
        } },
        razaoSocial: { type: String, required: true },
        email: { type: String, required: true, trim: true, lowercase: true },
        password: { type: String },
        qtdFuncionarios: { type: Number, required: true, default: 0 },
        status: { type: String, enum: ['A', 'I'], required: true, default: 'A' },
        dataIniCompetencia: { type: Date, required: true, default: Date.now },
        dataFimCompetencia: { type: Date, required: true, default: Date.now },
        iniExpediente: { type: String, required: false },
        fimExpediente: { type: String, required: false },
    }
);


EmpresaSchema.pre('save', function (next) {
    let empresa = this;

    if (empresa.password) {
        if (!empresa.isModified('password')){
            return next();
        }
            
        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
            if (err) return next(err);

            bcrypt.hash(empresa.password, salt, (err, hash) => {
                if (err) return next(err);

                empresa.password = hash;
                next();
            });
        });
    } else {
        empresa.password = '1234';

        if (!empresa.isModified('password'))
            return next();

        bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
            if (err) return next(err);

            bcrypt.hash(empresa.password, salt, (err, hash) => {
                if (err) return next(err);

                empresa.password = hash;
                next();
            });
        })
    }
});

EmpresaSchema.methods.comparePassword = async function (password) {
    try {
        const isMatch = await bcrypt.compare(password, this.password);
        return isMatch;
    } catch (err) {
        console.log(err);
    }
    return false;
}



export default mongoose.model('Empresa', EmpresaSchema);