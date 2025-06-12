import Reuniao from '../model/reuniao.js';
import Participantes from '../model/participantes.js';

export default {
    async create(req, res) {
        try {
            const reuniaoCriada = await Reuniao.create(req.body);
            const reuniao = await Reuniao.findById(reuniaoCriada._id).populate({
                path: 'organizador',
                select: 'nome email matricula'
            });
            return res.status(201).json(reuniao);
        } catch (err) {
            return res.status(400).json({ error: 'Error creating new Reuniao ' + err });
        }
    },
    async read(req, res) {
        try {
            const filter = req.query;
            const reunioes = await Reuniao.find(filter).populate({
                path: 'organizador',
                select: 'nome email matricula'
            });;
            return res.status(200).json(reunioes);
        } catch (err) {
            return res.status(400).json({ error: 'Error fetching Reunioes' });
        }
    },
    async readOne(req, res) {
        try {
            const reuniao = await Reuniao.findById(req.params.id).populate({
                path: 'organizador',
                select: 'nome email matricula'
            });;

            if (!reuniao) {
                return res.status(404).json({ error: 'Reunião não encontrada' });
            } else {
    
                // Buscar participantes relacionados à reunião
                const participantes = await Participantes.find({ reuniao: reuniao._id })
                     .populate({ path: 'pessoa', select: 'nome _id' });
                // Extrair apenas os nomes dos participantes
                const listaParticipantes = participantes.map(p => p.pessoa.nome);
        
                return res.status(200).json({
                    ...reuniao.toObject(),
                    participantes: listaParticipantes
                });
                
            }
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
            return res.status(400).json({ error: 'Error updating Reuniao ', err });
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
    },
    async deleteAll(req, res) {
        try {
            await Reuniao.deleteMany();
            return res.status(200).json({ message: 'All Reunioes deleted' });
        }
        catch (err) {
            return res.status(400).json({ error: 'Error deleting Reunioes' });
        }
    }
};
