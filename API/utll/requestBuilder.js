import dotenv from 'dotenv';
import { url } from './urls.js';

dotenv.config();

// require('dotenv').config();
// const facebook = require('./urls');
const token = process.env.WHATSAPP_TOKEN;
const phoneNumber = process.env.PHONE_NUMBER_ID;


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
                        buttons: buttons.map((name, index) => {
                            return {
                                type: "reply",
                                reply: {
                                    id: index + i,
                                    title: name,
                                },
                            };
                        })
                    },
                },

                // text: { body: "Ack: " + followUp },
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
                        buttons: buttons.map((name, index) => {
                            return {
                                type: 'reply',
                                reply: {
                                    id: index + i,
                                    title: name
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
                            rows: buttons.map((name, index) => {
                                return {
                                    id: index + i,
                                    title: name,
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