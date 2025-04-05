import Setor from '../model/setor.js';

export default {
    async create(req, res) {
        try {
            const setor = await Setor.create(req.body);
            return res.status(201).json(setor);
        } catch (err) {
            return res.status(400).json({ error: 'Error creating new Setor' });
        }
    },
    async read(req, res) {
        try {
            const filter = req.query;
            const setores = await Setor.find(filter);
            return res.status(200).json(setores);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Setores' });
        }
    },
    async readOne(req, res) {
        try {
            const setor = await Setor.findById(req.params.id);
            return res.status(200).json(setor);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Setor' });
        }
    },
    async update(req, res) {
        try {
            const setor = await Setor.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(setor);
        } catch (err) {
            return res.status(400).json({ error: 'Error updating Setor' });
        }
    },
    async delete(req, res) {
        try {
            await Setor.findByIdAndDelete(req.params.id);
            return res.status(204).send();
        } catch (err) {
            return res.status(400).json({ error: 'Error deleting Setor' });
        }
    }
};
