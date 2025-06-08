import feriado from '../model/feriado.js';

export default {
    async create(req, res) {
        try {
            const novoFeriado = await feriado.create(req.body);
            return res.status(201).json(novoFeriado);
        } catch (err) {
            return res.status(400).json({ error: 'Erro ao criar novo feriado, ' + err });
        }
    },

    async read(req, res) {
        try {
            const filtro = req.query;
            const feriados = await feriado.find(filtro);
            return res.status(200).json(feriados);
        } catch (err) {
            return res.status(400).json({ error: 'Erro ao buscar feriados' });
        }
    },

    async readOne(req, res) {
        try {
            const feriadoEncontrado = await feriado.findById(req.params.id);
            if (!feriadoEncontrado) {
                return res.status(404).json({ error: 'Feriado não encontrado' });
            }
            return res.status(200).json(feriadoEncontrado);
        } catch (err) {
            return res.status(400).json({ error: 'Erro ao buscar feriado' });
        }
    },

    async update(req, res) {
        try {
            const feriadoAtualizado = await feriado.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!feriadoAtualizado) {
                return res.status(404).json({ error: 'Feriado não encontrado para atualização' });
            }
            return res.status(200).json(feriadoAtualizado);
        } catch (err) {
            return res.status(400).json({ error: 'Erro ao atualizar feriado' });
        }
    },

    async delete(req, res) {
        try {
            const feriadoDeletado = await feriado.findByIdAndDelete(req.params.id);
            if (!feriadoDeletado) {
                return res.status(404).json({ error: 'Feriado não encontrado para exclusão' });
            }
            return res.status(204).send();
        } catch (err) {
            return res.status(400).json({ error: 'Erro ao excluir feriado' });
        }
    }
};