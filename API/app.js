require('dotenv').config();
var express = require('express');
var cookieParser = require('cookie-parser');
var cors = require('cors');
var bodyParser = require('body-parser');


const conn = require('./connection/db');


var empresaRouter = require('./routes/empresa');
var setorRouter = require('./routes/setor');
var pessoaRouter = require('./routes/pessoa');
var telefoneRouter = require('./routes/telefone');
var mensagemRouter = require('./routes/mensagem');
var reuniaoRouter = require('./routes/reuniao');

var app = express();
const PORT = process.env.PORT || 3000


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(express.static('images'));

// Routers
app.use('/empresa', empresaRouter);
app.use('/setor', setorRouter);
app.use('/pessoa', pessoaRouter);
app.use('/telefone', telefoneRouter);
app.use('/mensagem', mensagemRouter);
app.use('/reuniao', reuniaoRouter);

conn().then(()=> {
    app.listen(PORT, () => {
        console.log('listening for requests')
    })
})


module.exports = app;
