import telefone from "../../model/telefone.js";
import participantes from "../../model/participantes.js";
import mongoose from "mongoose";

const adicionaParticipante = async (participante, reuniao, cb) => {
    const tel = await telefone.findOne({ pessoa: participante._id }).populate('pessoa', 'nome');
    if (!tel) {
        console.log('Telefone não encontrado para a pessoa:', participante._id);
        return;
    }
    if (!reuniao || !reuniao._id) {
        console.log('Erro: reuniao não encontrada ou sem _id');
        return;
    }
    const participanteId = new mongoose.Types.ObjectId(participante._id);
    const reuniaoId = new mongoose.Types.ObjectId(reuniao._id);
    const novoParticipante = {
        pessoa: participanteId,
        reuniao: reuniaoId,
        conviteAceito: true
    }
    const participanteDoc = new participantes(novoParticipante);

    try {
        await participanteDoc.save();
        if (cb) {
            cb('Sucesso', tel);
        }
    } catch (error) {
        if (cb) {
            if (error.code === 11000) {
                cb('Duplicado');
            } else {
                cb('Erro');
            }
        }
        console.error('Erro ao adicionar participante:', error);
    }
    
}

export default adicionaParticipante;