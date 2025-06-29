import dotenv from 'dotenv';
import { url } from './urls.js';

dotenv.config();

const token = process.env.WHATSAPP_TOKEN;
const phoneNumber = process.env.PHONE_NUMBER_ID;

/**
 * 
 * @desc    Function to build a simple text message body object
 * @param {string} from - phone number
 * @param {string} message - message to be sent 
 * @returns {Object} - Returns body object for sending a text message
 */
export const textMessage = (from, message) => {
    let body = {
        method: "POST",
        url: url(phoneNumber),
        headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        data: {
            messaging_product: "whatsapp",
            to: from,
            type: "text",
            text: {
                body: message,
            },
        },
    }
    return body;

}

/**
 * @desc    Function to build a text message body object with header, footer and buttons
 * @param {string} from - phone number
 * @param {string} message - message to be sent
 * @param {list} buttons - list of buttons to be sent
 * @param {number} i - index of the button
 * @returns {Object} - Returns body object for sending a text message
 *
 */
export const fullMessage = (from, message, buttons, i) => {
    let body = {
        method: "POST",
        url: url(phoneNumber),
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: from,
            type: "interactive",
            interactive: {
                type: "button",
                header: {
                    type: 'text',
                    text: message.header
                },
                body: {
                    text: message.body,
                },
                footer: {
                    text: message.footer,
                },
                action: {
                    button: "botoes",
                    rows: buttons.map((name, index) => {
                        return  {
                                id: index + i,
                                title: name,
                            };
                        
                    })
                }
            },

        }
    }
    return body;
}

/**
 * @desc    Function to build a text message body object with simple buttons
 * @param {string} from - phone number
 * @param {string} message - message to be sent
 * @param {list} buttons - list of buttons to be sent
 * @param {number} i - index of the button
 * @returns {Object} - Returns body object for sending a text message
 */
export const interactiveMessage = (from, message, buttons, i) => {
    if (message instanceof Object) {
        let body = {
            method: "POST",
            url: url(phoneNumber),
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
            data: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: from,
                type: "interactive",
                interactive: {
                    type: "button",
                    header: {
                        type: 'text',
                        text: message.header
                    },
                    body: {
                        text: message.body,
                    },
                    action: {
                        buttons: buttons.map((button, index) => {
                            return {
                                type: "reply",
                                reply: {
                                    id: button.id,
                                    title: button.nome.substring(0, 24),
                                },
                            };
                        })
                    },
                },
            },
        }
        return body;
    } else {
        let body = {
            method: "POST",
            url: url(phoneNumber),
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
            },
            data: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: from,
                type: "interactive",
                interactive: {
                    type: "button",
                    body: {
                        text: message,
                    },
                    action: {
                        buttons: buttons.map((button, index) => {
                            return {
                                type: 'reply',
                                reply: {
                                    id: button.id,
                                    title: button.nome.substring(0, 24),
                                }
                            }
                        })
                    }
                }
            },
        }
        return body;
    }
}

/**
 * @desc    Function to build a message body object with a list of buttons
 * @param {string} from - phone number
 * @param {string} message - message to be sent
 * @param {list} buttons - list of objects of buttons to be sent
 * @param {string} name - of the button
 * @param {number} i - index of the button
 * @returns {Object} - Returns body object for sending a text message
 */
export const interactiveListMessage = (from, message, buttons, name, i) => {

    let body = {
        method: "POST",
        url: url(phoneNumber),
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: from,
            type: "interactive",
            interactive: {
                type: "list",
                body: {
                    text: message
                },
                action: {
                    button: name,
                    sections: [
                        {
                            title: "SECTION_1_TITLE",
                            rows: buttons.map((button) => {
                                return {
                                    id: button.id,
                                    title: button.nome.substring(0, 24),
                                }
                            })
                        }
                    ]
                }
            }
        }
    }
    return body;
}

/**
 * @desc    Function to build a message body object with a media
 * @param {string} from
 * @param {img} img
 * @returns {Object} - Returns body object for sending a media message
 */
export const mediaMessage = (from, img) => {
    let body = {
        method: "POST",
        url: url(phoneNumber),
        headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
        },
        data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: from,
            type: "image",
            image: {
                link: img,
            },
        },
    }
    return body;
}

/**
 * Função que monta o corpo da mensagem de template
 * 
 * @param {string} from - numero de telefone para quem será enviado a mensagem
 * @typedef {Object} template - template da mensagem
 * 
 * @returns {Object} - retorna o corpo da mensagem
 */
export const templateMessage = (from, template) => {
    let body = {
        method: "POST",
        url: url(phoneNumber),
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        data: {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: from,
            type: "template",
            template: buildTemplate(template.nome, template.parameters, template.language),
        },
    }
    return body;
}

/**
 * A função buildTemplate cria um template para enviar ao usuário.
 * 
 * @param {String} nome - nome do template salvo do WhatsApp
 * @param {Array} parameters - Lista de parâmetros a serem passados para o template
 * @returns {Object} - Retorna um objeto template do template
 */
const buildTemplate = (nome, parameters, language = 'pt_BR') => {
    return {
        name: nome,
        language: {
            code: language,
        },
        components: [{
            type: "body",
            parameters: parameters.map((p) => ({type: "text", text: p}))
        }]
    }
}