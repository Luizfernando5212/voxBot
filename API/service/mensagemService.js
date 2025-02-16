import Mensagem from '../model/mensagem.js';

export default {
    async create(req, res) {
        try {
            const mensagem = await Mensagem.create(req.body);
            return res.status(201).json(mensagem);
        } catch (err) {
            return res.status(400).json({ error: 'Error creating new Mensagem' });
        }
    },
    async read(req, res) {
        try {
            const mensagens = await Mensagem.find();
            return res.status(200).json(mensagens);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Mensagens' });
        }
    },
    async readOne(req, res) {
        try {
            const mensagem = await Mensagem.findById(req.params.id);
            return res.status(200).json(mensagem);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Mensagem' });
        }
    },
    async update(req, res) {
        try {
            const mensagem = await Mensagem.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json(mensagem);
        }
        catch (err) {
            return res.status(400).json({ error: 'Error updating Mensagem' });
        }
    },
    async delete(req, res) {
        try {
            await Mensagem.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Mensagem deleted' });
        }
        catch (err) {
            return res.status(400).json({ error: 'Error deleting Mensagem' });
        }
    }
};