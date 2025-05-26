import Pessoa from '../model/pessoa.js';
import Telefone from '../model/telefone.js';

export default {
    async create(req, res) {
        try {
            const { telefone, ...dadosPessoa } = req.body;

            const pessoa = await Pessoa.create(dadosPessoa);


            if (telefone) {
                await Telefone.create({ ...telefone, pessoa: pessoa._id });
            }


            return res.status(201).json({ ...pessoa.toObject(), telefone });
        } catch (err) {
            return res.status(400).json({ error: 'Error creating new Pessoa' + err });
        }
    },
    async read(req, res) {
        try {
            const filter = req.query;
            const pessoas = await Pessoa.find(filter);
            return res.status(200).json(pessoas);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Pessoas' + err });
        }
    },
    async readOne(req, res) {
        try {
            const pessoa = await Pessoa.findById(req.params.id);
            return res.status(200).json(pessoa);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Pessoa' + err });
        }
    },
    async update(req, res) {
        try {
            const pessoa = await Pessoa.findByIdAndUpdate(req.params.id, req.body, { new: true });

            let telefone = null;

            if (req.body.telefone) {
                await Telefone.updateOne(
                    { pessoa: pessoa._id },
                    { $set: { numero: req.body.telefone.numero } }
                ).select('numero');
                telefone = await Telefone.findOne({ pessoa: pessoa._id }).select('numero');
            }

            return res.status(200).json({ ...pessoa.toObject(), telefone });
        } catch (err) {
            return res.status(400).json({ error: 'Error updating Pessoa ' + err });
        }
    },
    async delete(req, res) {
        try {
            await Pessoa.findByIdAndDelete(req.params.id);
            return res.status(204).send();
        } catch (err) {
            return res.status(400).json({ error: 'Error deleting Pessoa' + err });
        }
    }
};
