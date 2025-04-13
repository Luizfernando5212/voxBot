import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import FormData from 'form-data'

dotenv.config();

const token = process.env.WHATSAPP_TOKEN;

async function audioBuilder(audioId) {
    console.log("caiu aqui", audioId)
    const url = await handleAudioMessage(audioId, token);
    const form = downloadAudioMessage(url);
    console.log(`esse é o form ${form}`);
    
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

export default audioBuilder