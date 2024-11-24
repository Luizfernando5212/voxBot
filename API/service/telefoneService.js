const Telefone = require('../model/telefone');

module.exports = {
    async create(req, res) {
        try {
            const telefone = await Telefone.create(req.body);
            return res.status(201).json(telefone);
        } catch (err) {
            return res.status(400).json({ error: 'Error creating new Telefone' });
        }
    },
    async read(req, res) {
        try {
            const telefones = await Telefone.find();
            return res.status(200).json(telefones);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Telefones' });
        }
    },
    async readOne(req, res) {
        try {
            const telefone = await Telefone.findById(req.params.id);
            return res.status(200).json(telefone);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Telefone' });
        }
    },
    async update(req, res) {
        try {
            const telefone = await Telefone.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(telefone);
        }
        catch (err) {
            return res.status(400).json({ error: 'Error updating Telefone' });
        }
    },
    async delete(req, res) {
        try {
            await Telefone.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Telefone deleted' });
        } catch (err) {
            return res.status(400).json({ error: 'Error deleting Telefone' });
        }
    }
};