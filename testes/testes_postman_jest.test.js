const axios = require('axios');

describe('Testes gerados a partir da coleção Postman', () => {

  test('Empresa', async () => {
    const response = await axios.get('http://localhost:3000/empresa');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Empresa', async () => {
    const response = await axios.put('http://localhost:3000/empresa/67435b00e0d941b70c326171', {
    "status": "A",
    "_id": "67435b00e0d941b70c326171",
    "cnpj": "1",
    "razaoSocial": "Empresa funcional",
    "qtdFuncionarios": 1,
    "email": "empresafuncional@gmail.com",
    "password": "1234",
    "__v": 0,
    "iniExpediente": "8:00",
    "fimExpediente": "19:30",
    "dataIniCompetencia": "2025-02-16T03:25:49.579Z",
    "dataFimCompetencia": "2025-02-16T03:25:49.579Z"
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Funcionários', async () => {
    const response = await axios.get('http://localhost:3000/empresa/67435b00e0d941b70c326171/funcionario');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('login', async () => {
    const response = await axios.post('https://voxbot.onrender.com/login', {
    "email": "empresafuncional@gmail.com",
    "password": "1234"
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Empresa', async () => {
    const response = await axios.post('http://localhost:3000/empresa', {
    "status": "A",
    "cnpj": "111111111111111",
    "razaoSocial": "Empresa nova 2",
    "qtdFuncionarios": 1,
    "email": "empresaNova@gmail.com",
    "password": "1234",
    "__v": 0,
    "iniExpediente": "8:00",
    "fimExpediente": "19:30",
    "dataIniCompetencia": "2025-02-16T03:25:49.579Z",
    "dataFimCompetencia": "2025-02-16T03:25:49.579Z"
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Setor', async () => {
    const response = await axios.get('http://localhost:3000/empresa/67435b00e0d941b70c326171/setor');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Setor', async () => {
    const response = await axios.put('http://localhost:3000/empresa/67435b00e0d941b70c326171/setor', {
    "_id": "67435c30e0d941b70c326178",
    "descricao": "RH",
    "empresa": "67435b00e0d941b70c326171",
    "__v": 0
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Setor', async () => {
    const response = await axios.post('http://localhost:3000/setor', {
    "descricao": "Engenharia",
    "empresa": "67435b00e0d941b70c326171",
    "__v": 0
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Pessoa', async () => {
    const response = await axios.post('http://localhost:3000/pessoa', {
    "nome": "teste com teledone",
    "apelido": null,
    "matricula": "9100",
    "setor": "67435c30e0d941b70c326178",
    "email": "lucas2@gmail.com",
    "telefone": {
        "numero": "55998855658"
    },
    "__v": 0
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Pessoa', async () => {
    const response = await axios.put('http://localhost:3000/pessoa/6833f5971157fcdab5f3eb7f', {
    "setor": "67fc07a2e039027fac942311",
    "telefone":{
        "numero": "5511999999984"
    },
    "__v": 0
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Pessoa', async () => {
    const response = await axios.get('http://localhost:3000/pessoa/674503629eb37fac01573957');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Pessoa', async () => {
    const response = await axios.delete('http://localhost:3000/pessoa/67b17ed87d0a074687accd62');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Numero', async () => {
    const response = await axios.post('http://localhost:3000/telefone', 
    {
        "pessoa": "67b3ec11e3985a4fcc85e2c5",
        "codigoArea": "1",
        "numero": "5519981235505",
        "__v": 0
    }
);
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Numero', async () => {
    const response = await axios.get('http://localhost:3000/telefone');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Numero', async () => {
    const response = await axios.put('http://localhost:3000/telefone/67ad3ec0b12695d7fb1edd86', {
    // "etapaFluxo": "CONFLITO_HORARIO",
    "etapaFluxo": "INICIAL",
    "reuniao": "682a8e725beb5d2b1774572d",
    "__v": 0
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Numero', async () => {
    const response = await axios.delete('https://voxbot.onrender.com/telefone/67ad3c8db12695d7fb1edd74');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('chatText Agendamento', async () => {
    const response = await axios.post('http://localhost:3000/chat', {
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP-BUSINESS-ACCOUNT-ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE-NUMBER",
                            "phone_number_id": "PHONE-NUMBER-ID"
                        },
                        "messages": [
                            {
                                "text": {
                                "body": "Gostaria de marcar uma reunião sobre o fechamento mensal para sexta das 10 às 10:30 com o Luiz"
                                },
                                "from": "5511981256835",
                                // "from": "5511976002488",
                                "type": "text"
                            }
                        ]
                    },
                    "field": "messages"
                }
            ]
        }
    ]
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('chatText listar reuniões', async () => {
    const response = await axios.post('http://localhost:3000/chat', {
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP-BUSINESS-ACCOUNT-ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE-NUMBER",
                            "phone_number_id": "PHONE-NUMBER-ID"
                        },
                        "messages": [
                            {
                                "text": {
                                "body": "Gostaria de marcar uma reunião sobre o fechamento mensal na sexta das 10 às 10:30 com o Gabriel e o Lucas"
                                },
                                "from": "5511976002488",
                                "type": "text"
                            }
                        ]
                    },
                    "field": "messages"
                }
            ]
        }
    ]
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('chatText Alterar horário', async () => {
    const response = await axios.post('http://localhost:3000/chat', {
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP-BUSINESS-ACCOUNT-ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE-NUMBER",
                            "phone_number_id": "PHONE-NUMBER-ID"
                        },
                        "messages": [
                            {
                                "text": {
                                "body": "Gostaria de marcar uma reunião sobre o fechamento mensal na sexta das 10 às 10:30 com o Gabriel e o Lucas"
                                },
                                "from": "5511976002488",
                                "type": "text"
                            }
                        ]
                    },
                    "field": "messages"
                }
            ]
        }
    ]
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('chatText Cancelar agendamento', async () => {
    const response = await axios.post('http://localhost:3000/chat', {
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP-BUSINESS-ACCOUNT-ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE-NUMBER",
                            "phone_number_id": "PHONE-NUMBER-ID"
                        },
                        "messages": [
                            {
                                "text": {
                                "body": "Cancelar reunião"
                                },
                                "from": "5511976002488",
                                "type": "text"
                            }
                        ]
                    },
                    "field": "messages"
                }
            ]
        }
    ]
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('chatInteractiveList PartDuplicado', async () => {
    const response = await axios.post('http://localhost:3000/chat', {
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP-BUSINESS-ACCOUNT-ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE-NUMBER",
                            "phone_number_id": "PHONE-NUMBER-ID"
                        },
                        "messages": [
                            {
                                "interactive": {
                                    "type": "list_reply",
                                    "list_reply": {
                                        "id": "67b3ec11e3985a4fcc85e2c5",
                                        "title": "Lucas - RH"
                                    }
                                },
                                "from": "5511976002488",
                                "type": "interactive"
                            }
                        ]
                    },
                    "field": "messages"
                }
            ]
        }
    ]
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('chatInteractiveList ConflitoHorario', async () => {
    const response = await axios.post('http://localhost:3000/chat', {
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP-BUSINESS-ACCOUNT-ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE-NUMBER",
                            "phone_number_id": "PHONE-NUMBER-ID"
                        },
                        "messages": [
                            {
                                "interactive": {
                                    "type": "list_reply",
                                    "list_reply": {
                                        "id": "2025-05-23 08:00:00-03:00 - 2025-05-23 08:30:00-03:00",
                                        "title": "08:00 - 08:30"
                                    }
                                },
                                "from": "5511976002488",
                                "type": "interactive"
                            }
                        ]
                    },
                    "field": "messages"
                }
            ]
        }
    ]
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('chatInteractive ConfirmarReuniao', async () => {
    const response = await axios.post('http://localhost:3000/chat', {
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP-BUSINESS-ACCOUNT-ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE-NUMBER",
                            "phone_number_id": "PHONE-NUMBER-ID"
                        },
                        "messages": [
                            {
                                "interactive": {
                                    "type": "button_reply",
                                    "button_reply": {
                                        "id": "CONFIRMAR",
                                        // "id": "CANCELAR",
                                        "title": "Confirmar"
                                    }   
                                },
                                "from": "5511976002488",
                                "type": "interactive"
                            }
                        ]
                    },
                    "field": "messages"
                }
            ]
        }
    ]
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('chatButton Aceite Reuniao', async () => {
    const response = await axios.post('http://localhost:3000/chat', {
    "object": "whatsapp_business_account",
    "entry": [
        {
            "id": "WHATSAPP-BUSINESS-ACCOUNT-ID",
            "changes": [
                {
                    "value": {
                        "messaging_product": "whatsapp",
                        "metadata": {
                            "display_phone_number": "PHONE-NUMBER",
                            "phone_number_id": "PHONE-NUMBER-ID"
                        },
                        "messages": [
                            {
                                "context": {
                                    "from": "15551890823",
                                    "id": "wamid.HBgNNTUxMTk3NjAwMjQ4OBUCABEYEjg5MDk3NDczNjFBM0NCREU2QQA="
                                },
                                "from": "5511976002488",
                                "id": "wamid.HBgNNTUxMTk3NjAwMjQ4OBUCABIYFDNBQkVFN0I0MjI5RDVERDM5RjJGAA==",
                                // "timestamp": "1747608505",
                                "type": "button",
                                "button": {
                                    "payload": "Aceitar",
                                    "text": "Aceitar"
                                }
                            }
                        ]
                    },
                    "field": "messages"
                }
            ]
        }
    ]
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('reuniao', async () => {
    const response = await axios.post('http://localhost:3000/reuniao', {
    "titulo": "Reunião de Alinhamento",
    "local": "Sala 302",
    "pauta": "Discutir entregas do projeto",
    "dataHoraInicio": "2025-02-10T14:00:00Z",
    "dataHoraFim": "2025-02-10T15:00:00Z",
    "organizador": "67ad3e9ab12695d7fb1edd82"
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Reuniao', async () => {
    const response = await axios.get('http://localhost:3000/reuniao');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('reuniao', async () => {
    const response = await axios.delete('http://localhost:3000/reuniao');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Participantes', async () => {
    const response = await axios.delete('http://localhost:3000/participantes');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Participantes', async () => {
    const response = await axios.get('http://localhost:3000/participantes');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Participantes', async () => {
    const response = await axios.delete('http://localhost:3000/participantes');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('MensagemWhatsapp Copy', async () => {
    const response = await axios.get('https://graph.facebook.com/v21.0/579623755231895/message_template_library');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('Whatsapp Template', async () => {
    const response = await axios.post('https://graph.facebook.com/v22.0/579623755231895/messages', {
    "messaging_product": "whatsapp",
    "to": "5511976002488",
    "type": "template",
    "template": {
        "name": "reuniao_marcado_envio",
        "language": {
            "code": "pt_BR"
        },
        "components": [{
            "type": "body",
            "parameters": [
                {"type": "text", "text": "Luiz"},
                {"type": "text", "text": "Alinhamento da Financeira"},
                {"type": "text", "text": "23/05/2025"},
                {"type": "text", "text": "13:00"},
                {"type": "text", "text": "13:30"}
            ]
        }]
    }
});
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('openAi', async () => {
    const response = await axios.get('https://api.openai.com/v1/models');
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

  test('openAi Copy', async () => {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    "model": "gpt-4o-mini",
    "store": true,
    "messages": [
      {"role": "user", "content": "write a haiku about ai"}
    ]
  });
    expect(response.status).toBeGreaterThanOrEqual(200);
    expect(response.status).toBeLessThan(400);
  });

});
