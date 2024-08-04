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

	const blogObjects = helper.initialBlogs.map(blog => new Blog(blog));
	const promiseArray = blogObjects.map(blog => blog.save());
	await Promise.all(promiseArray);
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

	test('A Specific Blog can be Viewed by its ID', async () => {
		const blogsAtStart = await helper.blogsInDB();

		const blogToView = blogsAtStart[0];

		const fetchedBlog = await api
			.get(`/api/blogs/${blogToView.id}`)
			.expect(200)
			.expect('Content-Type', /application\/json/);

		assert.deepStrictEqual(fetchedBlog.body, blogToView);
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

	test('If Likes is Missing in New Blog, Defaults it to Zero', async () => {
		const newBlog = {
			title: 'newTest',
			author: 'newTester',
			url: 'newTester.com',
		};

		await api
			.post('/api/blogs/')
			.send(newBlog)
			.expect(201)
			.expect('Content-Type', /application\/json/);

		const blogs = await helper.blogsInDB();
		assert.strictEqual(blogs.length, helper.initialBlogs.length + 1);

		const newBlogFromDB = blogs.find(blog => blog.title === newBlog.title);
		assert.strictEqual(newBlogFromDB.likes, 0);
	});
});

describe('API Delete Operations', () => {
	test('A Blog Can be Deleted', async () => {
		const blogsAtStart = await helper.blogsInDB();
		const blogToDelete = blogsAtStart[0];

		await api
			.delete(`/api/blogs/${blogToDelete.id}`)
			.expect(204);

		const blogsAtEnd = await helper.blogsInDB();
		const idsAtEnd = blogsAtEnd.map(blog => blog.id);
		assert(!idsAtEnd.includes(blogToDelete.id));

		assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);
	});
});

after(async () => {
	await mongoose.connection.close();
});
