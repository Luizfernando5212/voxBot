import Participantes from '../model/participantes.js';

export default {
    async create(req, res) {
        try {
            const participantes = await Participantes.create(req.body);
            return res.status(201).json(participantes);
        } catch (err) {
            return res.status(400).json({ error: 'Error creating new Participantes' });
        }
    },
    async read(req, res) {
        try {
            const participantes = await Participantes.find();
            return res.status(200).json(participantes);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Participantes' });
        }
    },
    async readOne(req, res) {
        try {
            const participantes = await Participantes.findById(req.params.id);
            return res.status(200).json(participantes);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Participantes' });
        }
    },
    async update(req, res) {
        try {
            const participantes = await Participantes.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(participantes);
        } catch (err) {
            return res.status(400).json({ error: 'Error updating Participantes' });
        }
    },
    async delete(req, res) {
        try {
            await Participantes.findByIdAndDelete(req.params.id);
            return res.status(204).send();
        } catch (err) {
            return res.status(400).json({ error: 'Error deleting Participantes' });
        }
    }
};