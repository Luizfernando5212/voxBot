import dotenv from 'dotenv';
import axios from 'axios';
import { textMessage } from '../utll/requestBuilder.js';
import mensagem from '../bot/mensagem.js';
import numero from '../model/telefone.js';
import fs from 'fs';
import FormData from 'form-data'

dotenv.config();

export default {
    /** 
    * @desc    Get access to the webhook
    * @route   GET /api/chat
    * @access  Public
    * @param   {req}
    * @param   {res}
    * @return  {Object} - Returns a 200 status code if the token is valid
    */
    async getAccess(req, res) {

        const verify_token = process.env.VERIFY_TOKEN;

        // Parse params from the webhook verification request
        let mode = req.query["hub.mode"];
        let token = req.query["hub.verify_token"];
        let challenge = req.query["hub.challenge"];

        // Check if a token and mode were sent
        if (mode && token) {
            // Check the mode and token sent are correct
            if (mode === "subscribe" && token === verify_token) {
                // Respond with 200 OK and challenge token from the request
                res.status(200).send(challenge);
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                res.sendStatus(403);
            }
        } else {
            return res.sendStatus(400);
        }
    },

    /**
     * @desc    Webhook for receiving messages
     * @route   POST /api/chat
     * @access  Public
     * @param   {req}
     * @param   {res}
     * @return  {Object} - Returns a 200 status code if the message is received
     */
    async webHook(req, res) {
        const body = req.body.entry[0];
        if (body?.changes?.[0]?.value?.messages?.[0]?.timestamp < Date.now() / 1000 - 10 || 
           !body?.changes?.[0]?.value?.messages?.[0]) {
            console.log('ignoring webhook, old message');
            return res.status(200).json({ message: 'ok' });
        }
        if (body.changes[0] && body.changes[0].field !== 'messages') {
            // not from the messages webhook so dont process
            return res.status(400).json({ boddy: body });
        };

        try {
            const message = body?.changes?.[0]?.value?.messages?.[0] || null;


            if (message === null) {
                return res.status(400).json({ body: body });
            } else {

                const consulta = await numero.find({ "numero": message.from })
                    .populate({
                        path: 'pessoa',
                        select: 'nome setor _id',
                        populate: {
                            path: 'setor',
                            populate: { path: 'empresa', select: 'status' }
                        }
                    });
                if (consulta.length === 0) {
                    const message = "Olá, você ainda não está cadastrado em nosso sistema, por favor, entre em contato com o administrador do sistema para mais informações.";
                    await axios(textMessage(message.from, message));
                } else if (consulta[0].pessoa.setor.empresa.status === 'I') {
                    // send message to user
                    const message = "Olá, a empresa a qual você pertence está inadimplente, por favor, entre em contato com o administrador do sistema para mais informações.";
                    await axios(textMessage(message.from, message));
                } else {
                    await mensagem(consulta, message, res);

                }
            }
        } catch (err) {
            console.log(err)
            return res.status(400).json({ error: err });
        }
    }

}

const handleAudioMessage = async (mediaId) => {
    const mediaResponse = await axios.get(url(mediaId), {
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
        const write = fs.creteWriteStream(audioPath);
        audioStream.data.pipe(write);
        write.on('finish', resolve);
        write.on('error', reject);
    });

    const form = new FormData();
    from.append('file', fs.createReadStream(audioPath));
    form.append('model', 'whisper-1');

    return form;
}
