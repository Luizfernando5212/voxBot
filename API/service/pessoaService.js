const Pessoa = require('../model/pessoa');
const Telefone = require('../model/telefone');

module.exports = {
    async create(req, res) {
        try {
            const { telefones, ...dadosPessoa } = req.body;

            const pessoa = await Pessoa.create(dadosPessoa);

            if (telefones && telefones.length > 0) {
                telefones.forEach(async (telefone) => {
                    await Telefone.create({ ...telefone, pessoa: pessoa._id });
                });
            }


            return res.status(201).json(pessoa);
        } catch (err) {
            return res.status(400).json({ error: 'Error creating new Pessoa' });
        }
    },
    async read(req, res) {
        try {
            const filter = req.query;
            const pessoas = await Pessoa.find(filter);
            return res.status(200).json(pessoas);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Pessoas' });
        }
    },
    async readOne(req, res) {
        try {
            const pessoa = await Pessoa.findById(req.params.id);
            return res.status(200).json(pessoa);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Pessoa' });
        }
    },
    async update(req, res) {
        try {
            const pessoa = await Pessoa.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(pessoa);
        } catch (err) {
            return res.status(400).json({ error: 'Error updating Pessoa' });
        }
    },
    async delete(req, res) {
        try {
            await Pessoa.findByIdAndDelete(req.params.id);
            return res.status(204).send();
        } catch (err) {
            return res.status(400).json({ error: 'Error deleting Pessoa' });
        }
    }
};