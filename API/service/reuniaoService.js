const Reuniao = require('../model/reuniao');

module.exports = {
    async create(req, res) {
        try {
            const reuniao = await Reuniao.create(req.body);
            return res.status(201).json(reuniao);
        } catch (err) {
            return res.status(400).json({ error: 'Error creating new Reuniao' });
        }
    },
    async read(req, res) {
        try {
            const reunioes = await Reuniao.find();
            return res.status(200).json(reunioes);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Reunioes' });
        }
    },
    async readOne(req, res) {
        try {
            const reuniao = await Reuniao.findById(req.params.id);
            return res.status(200).json(reuniao);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Reuniao' });
        }
    },
    async update(req, res) {
        try {
            const reuniao = await Reuniao.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(reuniao);
        }
        catch (err) {
            return res.status(400).json({ error: 'Error updating Reuniao' });
        }
    },
    async delete(req, res) {
        try {
            await Reuniao.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Reuniao deleted' });
        }
        catch (err) {
            return res.status(400).json({ error: 'Error deleting Reuniao' });
        }
    }
};