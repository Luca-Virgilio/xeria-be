const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
//import db config
require('./app_api/models/db');

const indexRouter = require('./app_api/routes/index');
const userRouter = require('./app_api/routes/users');
const onnxRouter = require('./app_api/routes/onnxModel');



const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// allow CORS
// app.use('/api', (req, res, next) => {
//     res.header('Access-Control-Allow-Origin', 'http://localhost:4200');
//     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With,Content-Type, Accept, Authorization');
//     next();
//   });

app.use('/', indexRouter);
app.use('/users', userRouter);
app.use('/onnx', onnxRouter);

module.exports = app;
