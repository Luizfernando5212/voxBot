require('dotenv').config();

module.exports = {
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
                console.log("WEBHOOK_VERIFIED");
                res.status(200).send(challenge);
            } else {
                // Responds with '403 Forbidden' if verify tokens do not match
                res.sendStatus(403);
            }
        } else {
            return res.sendStatus(400);
        }
    },

    async webHook(req, res) {
        const body = req.body.entry[0];
        console.log(body);
        if(body.field !== 'messages'){
            // not from the messages webhook so dont process
            return res.sendStatus(400);
        };
        return res.sendStatus(200);
    }

}

