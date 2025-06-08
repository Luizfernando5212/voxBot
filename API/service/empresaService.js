import Empresa from '../model/empresa.js';
import Setor from '../model/setor.js';
import Pessoa from '../model/pessoa.js';
import Telefone from '../model/telefone.js';


export default {
    async create(req, res) {
        try {
            const empresa = await Empresa.create(req.body);
            empresa.save();
            return res.status(201).json(empresa);
        } catch (err) {
            return res.status(400).json({ error: 'Error creating new Empresa' });
        }
    },
    async read(req, res) {
        try {
            const filter = req.query;
            const empresas = await Empresa.find(filter);
            return res.status(200).json(empresas);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Empresas' });
        }
    },
    async readOne(req, res) {
        try {
            const id = req.user.id || req.params.id; // Use user ID from token or ID from params
            const empresa = await Empresa.findById(id);
            return res.status(200).json(empresa);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Empresa' });
        }
    },
    async readSetor(req, res) {
        try {
            const id = req.user.id || req.params.id; // Use user ID from token or ID from params
            const setores = await Setor.find({ empresa: id });
            if (!setores) {
                return res.status(404).json({ error: 'Setores not found for this Empresa' });
            }
            return res.status(200).json(setores);
        }
        catch (err) {
            return res.status(400).json({ error: 'Error fetching Empresa setores' });
        }
    },
    readFeriado(req, res) {
        try {
            const id = req.user.id || req.params.id; // Use user ID from token or ID from params
            // Assuming you have a Feriado model to fetch holidays
            const feriados = Feriado.find({ empresa: id });
            if (!feriados) {
                return res.status(404).json({ error: 'Feriados not found for this Empresa' });
            }
            return res.status(200).json(feriados);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Empresa feriados' });
        }
    },
    async readFuncionarios(req, res) {
        try {
            const id = req.user.id || req.params.id; // Use user ID from token or ID from params

            const setores = (await Setor.find({ empresa: id }).select('_id')).map(setor => setor._id);
            const pessoas = await Pessoa.find({ setor: { $in: setores } }).populate('setor', 'descricao');

            if (!pessoas) {
                return res.status(404).json({ error: 'Empresa not found' });
            }

            const funcionarios = await Promise.all(
                pessoas.map(async (pessoa) => {
                    const telefone = await Telefone.findOne({ pessoa: pessoa._id }).select('numero');
                    return {
                        ...pessoa.toObject(),
                        telefone,
                    };
                })
            );
            return res.status(200).json(funcionarios);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Empresa funcionarios' });
        }
    },
    async update(req, res) {
        try {
            const oldEmpresa = await Empresa.findById(req.params.id);
            console.log(oldEmpresa)
            oldEmpresa.set(req.body);
            console.log(oldEmpresa)
            const empresa = await oldEmpresa.save();
            // const empresa = await Empresa.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(empresa);
        } catch (err) {
            console.log(err)
            return res.status(400).json({ error: 'Error updating Empresa' });
        }
    },
    async delete(req, res) {
        try {
            await Empresa.findByIdAndDelete(req.params.id);
            return res.status(204).send();
        } catch (err) {
            return res.status(400).json({ error: 'Error deleting Empresa' });
        }
    }
};
