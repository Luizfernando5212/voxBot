import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import FormData from 'form-data';
import text from '../text/mensagemTexto.js';

dotenv.config();

const token = process.env.WHATSAPP_TOKEN;
const openAiKey = process.env.OPENAI_API_KEY;

async function audioBuilder(consulta, numeroTel, audioId, res) {
    try {
        const url = await handleAudioMessage(audioId, token);
        const form = await downloadAudioMessage(url);
        const response = await sendToOpeAI(form);

        console.log(response);
        await axios(text(consulta, numeroTel, response, res));
    } catch (err) {
        console.log(`Não conseguiu enviar a mensagem: ${err}`);
    }
}

const sendToOpeAI = async (form) => {
    const response = await axios({
        method: 'POST',
        url: 'https://api.openai.com/v1/audio/transcriptions',
        headers: {
            Authorization: `Bearer ${openAiKey}`,
            "Content-Type": "multipart/form-data",
        },
        data: form
    });
    return response.data.text;
}

const handleAudioMessage = async (audioId) => {
    const mediaResponse = await axios({
        method: 'GET',
        url: `https://graph.facebook.com/v22.0/${audioId}`,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        }
    })
    return mediaResponse.data.url;
}

const downloadAudioMessage = async(mediaResponseUrl) => {
    const audioPath = 'mensagem.ogg';
    const audioStream = await axios({
        url: mediaResponseUrl,
        method: 'GET',
        responseType: 'stream',
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        }
    });

    await new Promise((resolve, reject) => {
        const write = fs.createWriteStream(audioPath);
        audioStream.data.pipe(write);
        write.on('finish', resolve);
        write.on('error', reject);
    });

    const form = new FormData();
    form.append('file', fs.createReadStream(audioPath));
    form.append('model', 'whisper-1');

    return form;
}

export default audioBuilder;