import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import bodyParser from 'body-parser';
import envioLembrete from './bot/operacoes/lembrete.js';
import cron from "node-cron";

const API = '/api';
dotenv.config();

import conn from './connection/db.js';
// const conn = require('./connection/db');

// Importando reteadoes
import empresaRouter from './routes/empresa.js';
import setorRouter from './routes/setor.js';
import pessoaRouter from './routes/pessoa.js';
import telefoneRouter from './routes/telefone.js';
import reuniaoRouter from './routes/reuniao.js';
import participantesRouter from './routes/participantes.js';
import chatRouter from './routes/chat.js';
import loginRouter from './routes/login.js';
import feriadoRouter from './routes/feriado.js';
// import lembreRouter from './routes/lembrete.js';

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
app.use(API + '/reuniao', reuniaoRouter);
app.use(API + '/participantes', participantesRouter);
app.use(API + '/chat', chatRouter);
app.use(API + '/feriado', feriadoRouter);
app.use('/login', loginRouter);
// app.use(API + '/lembrete', lembreRouter);

// Rota padrão
conn().then(()=> {
    app.listen(PORT, () => {
        console.log('listening for requests: ' + PORT)
    })
    cron.schedule('*/5 * * * *', async() => {
        try {
            envioLembrete();
        } catch(error){
            console.log("Erro ao executar o cron", error)
        }
    });
})


export default app;
