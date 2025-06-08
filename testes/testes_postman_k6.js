import http from 'k6/http';
import { check } from 'k6';

export default function () {

  let res = http.get('http://localhost:3000/empresa');
  check(res, { 'GET Empresa status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.get('http://localhost:3000/empresa/67435b00e0d941b70c326171/funcionario');
  check(res, { 'GET Funcionários status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('https://voxbot.onrender.com/login', `{
    "email": "empresafuncional@gmail.com",
    "password": "1234"
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST login status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/empresa', `{
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
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST Empresa status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.get('http://localhost:3000/empresa/67435b00e0d941b70c326171/setor');
  check(res, { 'GET Setor status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/setor', `{
    "descricao": "Engenharia",
    "empresa": "67435b00e0d941b70c326171",
    "__v": 0
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST Setor status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/pessoa', `{
    "nome": "teste com teledone",
    "apelido": null,
    "matricula": "9100",
    "setor": "67435c30e0d941b70c326178",
    "email": "lucas2@gmail.com",
    "telefone": {
        "numero": "55998855658"
    },
    "__v": 0
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST Pessoa status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.get('http://localhost:3000/pessoa/674503629eb37fac01573957');
  check(res, { 'GET Pessoa status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/telefone', `
    {
        "pessoa": "67b3ec11e3985a4fcc85e2c5",
        "codigoArea": "1",
        "numero": "5519981235505",
        "__v": 0
    }
`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST Numero status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.get('http://localhost:3000/telefone');
  check(res, { 'GET Numero status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/chat', `{
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
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST chatText Agendamento status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/chat', `{
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
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST chatText listar reuniões status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/chat', `{
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
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST chatText Alterar horário status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/chat', `{
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
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST chatText Cancelar agendamento status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/chat', `{
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
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST chatInteractiveList PartDuplicado status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/chat', `{
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
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST chatInteractiveList ConflitoHorario status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/chat', `{
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
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST chatInteractive ConfirmarReuniao status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/chat', `{
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
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST chatButton Aceite Reuniao status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('http://localhost:3000/reuniao', `{
    "titulo": "Reunião de Alinhamento",
    "local": "Sala 302",
    "pauta": "Discutir entregas do projeto",
    "dataHoraInicio": "2025-02-10T14:00:00Z",
    "dataHoraFim": "2025-02-10T15:00:00Z",
    "organizador": "67ad3e9ab12695d7fb1edd82"
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST reuniao status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.get('http://localhost:3000/reuniao');
  check(res, { 'GET Reuniao status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.get('http://localhost:3000/participantes');
  check(res, { 'GET Participantes status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('https://graph.facebook.com/v22.0/579623755231895/messages', `{
    "messaging_product": "whatsapp",
    "to": "5511981256835",
    "type": "text",
    "text": {
        "body": "Se liga, teste para ver se dá para mandar mensagem sem ter nada"
    }
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST MensagemWhatsapp status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.get('https://graph.facebook.com/v21.0/579623755231895/message_template_library');
  check(res, { 'GET MensagemWhatsapp Copy status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('https://graph.facebook.com/v22.0/579623755231895/messages', `{
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
}`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST Whatsapp Template status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.get('https://api.openai.com/v1/models');
  check(res, { 'GET openAi status 2xx': (r) => r.status >= 200 && r.status < 400 });

  res = http.post('https://api.openai.com/v1/chat/completions', `{
    "model": "gpt-4o-mini",
    "store": true,
    "messages": [
      {"role": "user", "content": "write a haiku about ai"}
    ]
  }`, {
    headers: { "Content-Type": "application/json" },
  });
  check(res, { 'POST openAi Copy status 2xx': (r) => r.status >= 200 && r.status < 400 });

}
