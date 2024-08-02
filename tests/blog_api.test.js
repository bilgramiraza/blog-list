const { describe, test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blogs');
const helper = require('./test_helper');

const api = supertest(app);

beforeEach(async () => {
	await Blog.deleteMany({});
	let blogObject = new Blog(helper.initialBlogs[0]);
	await blogObject.save();
	blogObject = new Blog(helper.initialBlogs[1]);
	await blogObject.save();
});

describe('API Read Operations', () => {
	test('Blogs are returned as JSON', async () => {
		await api
			.get('/api/blogs')
			.expect(200)
			.expect('Content-Type', /application\/json/);
	});

	test('There are Two Blogs', async () => {
		const response = await api.get('/api/blogs');

		assert.strictEqual(response.body.length, helper.initialBlogs.length);
	});

	test('The First Blog is Titled \'test\'', async () => {
		const response = await api.get('/api/blogs');

		const titles = response.body.map(e => e.title);
		assert(titles.includes('test'));
	});
});

describe('API Write Operations', () => {
	test('A Valid Blog is Added', async () => {
		const newBlog = {
			title: 'newTest',
			author: 'newTester',
			url: 'newTester.com',
			likes: 69,
		};

		await api
			.post('/api/blogs/')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/);

		const blogs = await helper.blogsInDB();
		assert.strictEqual(blogs.length, helper.initialBlogs.length + 1);

		const titles = blogs.map(b => b.title);
		assert(titles.includes('newTest'));
	});

	test('Invalid Blog Won\'t be added', async () => {
		const newBlog = {
			likes: 69,
		};

		await api
			.post('/api/blogs/')
			.send(newBlog)
			.expect(400);

		const blogs = await helper.blogsInDB();
		assert.strictEqual(blogs.length, helper.initialBlogs.length);
	});
});

after(async () => {
	await mongoose.connection.close();
});
