import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';

const API = '/api';
dotenv.config();

import conn from './connection/db.js';
// const conn = require('./connection/db');

// Importando reteadoes
import empresaRouter from './routes/empresa.js';
import setorRouter from './routes/setor.js';
import pessoaRouter from './routes/pessoa.js';
import telefoneRouter from './routes/telefone.js';
import mensagemRouter from './routes/mensagem.js';
import reuniaoRouter from './routes/reuniao.js';
import participantesRouter from './routes/participantes.js';
import chatRouter from './routes/chat.js';

var app = express();
// Declarando porta a ser utilizada
const PORT = process.env.PORT || 3000

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('images'));

// Routers
app.use(API + '/empresa', empresaRouter);
app.use(API + '/setor', setorRouter);
app.use(API + '/pessoa', pessoaRouter);
app.use(API + '/telefone', telefoneRouter);
app.use(API + '/mensagem', mensagemRouter);
app.use(API + '/reuniao', reuniaoRouter);
app.use(API + '/participantes', participantesRouter);
app.use(API + '/chat', chatRouter);

// Rota padrão
conn().then(()=> {
    app.listen(PORT, () => {
        console.log('listening for requests: ' + PORT)
    })
})


export default app;
