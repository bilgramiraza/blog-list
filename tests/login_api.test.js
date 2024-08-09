const { describe, test, after, before } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const helper = require('./test_helper');

const api = supertest(app);

describe('Login API Tests', () => {
	before(async () => {
		await User.deleteMany({});

		const passwordHash = await bcrypt.hash('secret', 10);
		const user = new User({ username: 'root', name: 'root', passwordHash });

		await user.save();
	});

	test('Allows Login of Valid User returning Username, Name and Token', async () => {
		const users = await helper.usersInDB();

		const response = await api
			.post('/api/login')
			.send({ username: 'root', password: 'secret' })
			.expect(200)
			.expect('Content-Type', /application\/json/);

		assert.strictEqual(response.body.username, users[0].username);
		assert.strictEqual(response.body.name, users[0].name);
		assert(response.body.token);
	});

	test('Blocks Login of Non Existant Username returning status code 401', async () => {
		const response = await api
			.post('/api/login')
			.send({ username: 'groot', password: 'secret' })
			.expect(401)
			.expect('Content-Type', /application\/json/);

		assert.strictEqual(response.body.error, 'invalid username or password');
	});

	test('Blocks Login of Wrong Password returning status code 401', async () => {
		const response = await api
			.post('/api/login')
			.send({ username: 'root', password: 'ecret' })
			.expect(401)
			.expect('Content-Type', /application\/json/);

		assert.strictEqual(response.body.error, 'invalid username or password');
	});
});

after(async () => {
	await mongoose.connection.close();
});
