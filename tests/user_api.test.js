const { describe, test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const helper = require('./test_helper');

const api = supertest(app);

describe('API Tests when there is One User saved', () => {
	beforeEach(async () => {
		await User.deleteMany({});

		const passwordHash = await bcrypt.hash('secret', 10);
		const user = new User({ username: 'root', name: 'root', passwordHash });

		await user.save();
	});

	describe('API Write Operations', () => {
		test('Allows creation of new valid user', async () => {
			const usersAtStart = await helper.usersInDB();

			const newUser = {
				username: 'raza',
				name: 'Raza Hassan',
				password: 'assword',
			};

			await api
				.post('/api/users')
				.send(newUser)
				.expect(201)
				.expect('Content-Type', /application\/json/);

			const usersAtEnd = await helper.usersInDB();
			assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

			const usernames = usersAtEnd.map(user => user.username);
			assert(usernames.includes(newUser.username));
		});

		test('Blocks creation of new user with Duplicate Username', async () => {
			const usersAtStart = await helper.usersInDB();

			const newUser = {
				username: 'root',
				name: 'Rooted',
				password: 'passwor',
			};

			const result = await api
				.post('/api/users')
				.send(newUser)
				.expect(400)
				.expect('Content-Type', /application\/json/);

			assert(result.body.error.includes('expected `username` to be unique'));

			const usersAtEnd = await helper.usersInDB();
			assert.strictEqual(usersAtEnd.length, usersAtStart.length);
		});

		test('Blocks creation of new user with Invalid Username', async () => {
			const newUser = {
				username: 'ra',
				name: 'Roz',
				password: 'passwor',
			};

			const result = await api
				.post('/api/users')
				.send(newUser)
				.expect(400);

			assert(result.body.error.includes('Username too short(Min 3)'));
		});

		test('Blocks creation of new user with Invalid Password', async () => {
			const newUser = {
				username: 'raza',
				name: 'Raza',
				password: 'pa',
			};

			const result = await api
				.post('/api/users')
				.send(newUser)
				.expect(400);

			assert(result.body.error.includes('Password too short(Min 3)'));
		});
	});

	describe('API Read Operations', () => {
		test('Fetch All Users', async () => {
			const usersAtStart = await helper.usersInDB();

			const results = await api
				.get('/api/users')
				.expect(200)
				.expect('Content-Type', /application\/json/);

			assert.strictEqual(usersAtStart.length, results.body.length);
			assert.deepStrictEqual(usersAtStart, results.body);
		});
	});
});

after(async () => {
	User.deleteMany({});
	await mongoose.connection.close();
});
