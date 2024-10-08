const logger = require('./logger');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const tokenExtractor = (request, _response, next) => {
	const authorization = request.get('authorization');
	if (authorization && authorization.startsWith('Bearer ')) {
		request.token = authorization.replace('Bearer ', '');
	}
	next();
};

const userExtractor = async (request, response, next) => {
	const decodedToken = jwt.verify(request.token, process.env.SECRET);
	if (!decodedToken.id) {
		return response.status(401).json({ error: 'token invalid' });
	}

	request.user = await User.findById(decodedToken.id);
	next();
};

const unknownEndpoint = (_request, response) => {
	response.status(404).send({ error: 'unknown Endpoint' });
};

const errorHandler = (error, _request, response, next) => {
	logger.error(error.message);
	switch (error.name) {
		case 'CastError':
			return response.status(400).send({ error: 'malformatted Id' });
		case 'ValidationError':
			return response.status(400).send({ error: error.message.split(':')[2] });
		case 'JsonWebTokenError':
			return response.status(401).send({ error: 'token invalid' });
		case 'TokenExpiredError':
			return response.status(401).send({ error: 'token expired' });
		case 'MongoServerError':
			if (error.message.includes('E11000 duplicate key error')) {
				return response.status(400).send({ error: 'expected `username` to be unique' });
			}
		default: next(error);
	}
};

module.exports = {
	tokenExtractor,
	userExtractor,
	unknownEndpoint,
	errorHandler,
};
