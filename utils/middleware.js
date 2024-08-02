const logger = require('./logger');

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
		default: next(error);
	}
};

module.exports = {
	unknownEndpoint,
	errorHandler,
};
