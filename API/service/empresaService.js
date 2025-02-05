const Empresa = require('../model/empresa');

module.exports = {
    async create(req, res) {
        try {
            const empresa = await Empresa.create(req.body);
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
            const empresa = await Empresa.findById(req.params.id);
            return res.status(200).json(empresa);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Empresa' });
        }
    },
    async update(req, res) {
        try {
            const empresa = await Empresa.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(empresa);
        } catch (err) {
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