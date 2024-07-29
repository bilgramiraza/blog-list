const logger = require('./logger');

const unknownEndpoint = (request, response) => {
	response.status(404).send({ error: 'unknown Endpoint' });
};

module.exports = {
	unknownEndpoint
};
