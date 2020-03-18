const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('./db/mongoose.js');
const userRouter = require('./routes/user-routes');
const cardsRouter = require('./routes/cards-routes');

const app = express();
app.use(express.json());
app.use(morgan('tiny'));
app.use(cors());
app.use('/user', userRouter);
app.use('/cards', cardsRouter);

module.exports = app;
