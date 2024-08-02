const { test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blogs');

const api = supertest(app);

const initialBlogs = [
	{
		title: 'test',
		author: 'tester',
		url: 'tester.com',
		likes: 420,
	},
	{
		title: 'test2',
		author: 'tester',
		url: 'tester.com',
		likes: 69,
	},
];

beforeEach(async () => {
	await Blog.deleteMany({});
	let blogObject = new Blog(initialBlogs[0]);
	await blogObject.save();
	blogObject = new Blog(initialBlogs[1]);
	await blogObject.save();
});

test('Blogs are returned as JSON', async () => {
	await api
		.get('/api/blogs')
		.expect(200)
		.expect('Content-Type', /application\/json/);
});

test('There are Two Blogs', async () => {
	const response = await api.get('/api/blogs');

	assert.strictEqual(response.body.length, initialBlogs.length);
});

test('The First Blog is Titled \'test\'', async () => {
	const response = await api.get('/api/blogs');

	const titles = response.body.map(e => e.title);
	assert(titles.includes('test'));
});

after(async () => {
	await mongoose.connection.close();
});
