import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import FormData from 'form-data'

dotenv.config();

const token = process.env.WHATSAPP_TOKEN;

async function audioBuilder(audioId) {
    console.log("caiu aqui", audioId)
    const url = handleAudioMessage(audioId, token);
    console.log(`essa é a url ${url}`);
    // const form = downloadAudioMessage(url);
    
}


const handleAudioMessage = async (audioId) => {
    const mediaResponse = await axios.get(`https://graph.facebook.com/v22.0/${audioId}`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        }
    })
    return mediaResponse.data.url;
}

const downloadAudioMessage = async(mediaResponseUrl) => {
    const audioPath = 'mensagem.ogg';
    const audioStream = await axios.get(mediaResponseUrl, {
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