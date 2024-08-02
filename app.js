const express = require('express')
const app = express()
const cors = require('cors')
const config = require('./utils/config');
const blogsRouter = require('./controllers/blogs');
const middleware = require('./utils/middleware');
const mongoose = require('mongoose');

mongoose.connect(config.MONGODB_URI);

app.use(cors())
app.use(express.json())

app.use('/api/blogs', blogsRouter);

app.use(middleware.unknownEndpoint);
app.use(middleware.errorHandler);

module.exports = app;
