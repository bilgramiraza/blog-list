const { describe, test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const helper = require('./test_helper');

const api = supertest(app);

describe('API Tests when there are some notes saved', () => {
	beforeEach(async () => {
		await Blog.deleteMany({});
		await User.deleteMany({});

		const passwordHash = await bcrypt.hash('secret', 10);
		const user = new User({ username: 'root', name: 'root', passwordHash });

		await user.save();

		await Blog.insertMany(helper.getInitialBlogs(user._id));
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

	describe('Fetching Specific Blogs using their ID', () => {
		test('Fetch Blog with Id', async () => {
			const blogsAtStart = await helper.blogsInDB();

			const blogToView = blogsAtStart[0];

			const fetchedBlog = await api
				.get(`/api/blogs/${blogToView.id}`)
				.expect(200)
				.expect('Content-Type', /application\/json/);

			assert.deepStrictEqual(fetchedBlog.body, blogToView);
		});

		test('Fetching Non Existing Blog returns status code 404', async () => {
			const validNonExistingId = await helper.nonExistingId();

			await api
				.get(`/api/blogs/${validNonExistingId}`)
				.expect(404);
		});

		test('Fetching Blogs with Invalid ID returns status code 400', async () => {
			const invalidId = 'invalidId';

			await api
				.get(`/api/blogs/${invalidId}`)
				.expect(400);
		});
	});

	describe('API Write Operations', async () => {
		test('A Valid Blog is Added', async () => {
			const newBlog = {
				title: 'newTest',
				author: 'newTester',
				url: 'newTester.com',
				likes: 69,
			};

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.post('/api/blogs/')
				.send(newBlog)
				.set('Authorization', `Bearer ${token}`)
				.expect(201)
				.expect('Content-Type', /application\/json/);

			const blogs = await helper.blogsInDB();
			assert.strictEqual(blogs.length, helper.initialBlogs.length + 1);

			const titles = blogs.map(b => b.title);
			assert(titles.includes('newTest'));
		});

		test('A Valid Blog is Added and Its User is Set based on the Token provided', async () => {
			const newBlog = {
				title: 'newTest',
				author: 'newTester',
				url: 'newTester.com',
				likes: 69,
			};

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			const response = await api
				.post('/api/blogs/')
				.send(newBlog)
				.set('Authorization', `Bearer ${token}`)
				.expect(201)
				.expect('Content-Type', /application\/json/);

			const users = await helper.usersInDB();
			const rootUser = users[0];

			assert(response.body.user, rootUser.id);
		});

		test('Blogs Missing \'Title\' Won\'t be added and returns Status code 400', async () => {
			const newBlog = {
				author: 'newTester',
				url: 'newTester.com',
				likes: 69,
			};

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.post('/api/blogs/')
				.send(newBlog)
				.set('Authorization', `Bearer ${token}`)
				.expect(400);

			const blogs = await helper.blogsInDB();
			assert.strictEqual(blogs.length, helper.initialBlogs.length);
		});

		test('Blogs Missing \'Author\' Won\'t be added and returns Status code 400', async () => {
			const newBlog = {
				title: 'newTest',
				url: 'newTester.com',
				likes: 69,
			};

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.post('/api/blogs/')
				.send(newBlog)
				.set('Authorization', `Bearer ${token}`)
				.expect(400);

			const blogs = await helper.blogsInDB();
			assert.strictEqual(blogs.length, helper.initialBlogs.length);
		});

		test('Blogs Missing \'URL\' Won\'t be added and returns Status code 400', async () => {
			const newBlog = {
				title: 'newTest',
				author: 'newTester',
				likes: 69,
			};

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.post('/api/blogs/')
				.send(newBlog)
				.set('Authorization', `Bearer ${token}`)
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

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.post('/api/blogs/')
				.send(newBlog)
				.set('Authorization', `Bearer ${token}`)
				.expect(201)
				.expect('Content-Type', /application\/json/);

			const blogs = await helper.blogsInDB();
			assert.strictEqual(blogs.length, helper.initialBlogs.length + 1);

			const newBlogFromDB = blogs.find(blog => blog.title === newBlog.title);
			assert.strictEqual(newBlogFromDB.likes, 0);
		});

		test('Valid Blog Won\'t be added if User Token Is Missing and returns Status code 401', async () => {
			const newBlog = {
				title: 'newTest',
				author: 'newTester',
				url: 'newTester.com',
				likes: 69,
			};

			await api
				.post('/api/blogs/')
				.send(newBlog)
				.expect(401);

			const blogs = await helper.blogsInDB();
			assert.strictEqual(blogs.length, helper.initialBlogs.length);
		});
	});

	describe('API Delete Operations', () => {
		test('A Blog Can be Deleted w/ Valid and matching JWT Token Provided', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const blogToDelete = blogsAtStart[0];

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.delete(`/api/blogs/${blogToDelete.id}`)
				.set('Authorization', `Bearer ${token}`)
				.expect(204);

			const blogsAtEnd = await helper.blogsInDB();
			assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);

			const idsAtEnd = blogsAtEnd.map(blog => blog.id);
			assert(!idsAtEnd.includes(blogToDelete.id));
		});

		test('A Blog Deletion Request without JWT Token Doesn\'t Delete the Blog and Returns Status 401', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const blogToDelete = blogsAtStart[0];

			await api
				.delete(`/api/blogs/${blogToDelete.id}`)
				.expect(401);

			const blogsAtEnd = await helper.blogsInDB();
			assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
		});

		test('A Blog Deletion Request w/ Invalid JWT Token Doesn\'t Delete the Blog and Returns Status 401', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const blogToDelete = blogsAtStart[0];

			await api
				.delete(`/api/blogs/${blogToDelete.id}`)
				.set('Authorization', "Bearer InvalidToken")
				.expect(401);

			const blogsAtEnd = await helper.blogsInDB();
			assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
		});

		test('An non Existing Blog\'s Id returns 204 with Nothing Deleted', async () => {
			const validNonExistingId = await helper.nonExistingId();

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.delete(`/api/blogs/${validNonExistingId}`)
				.set('Authorization', `Bearer ${token}`)
				.expect(204);

			const blogsAtEnd = await helper.blogsInDB();
			assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
		});

		test('An Invalid Id being Deleted returns 400', async () => {
			const invalidId = 'invalidId';

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.delete(`/api/blogs/${invalidId}`)
				.set('Authorization', `Bearer ${token}`)
				.expect(400);
		});
	});

	describe('API Update Operations', () => {
		test('An Existing Blog\'s Title Can be Updated by its User', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				...blogsAtStart[0],
				title: 'Modified blog',
			};

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.put(`/api/blogs/${updateBlog.id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updateBlog)
				.expect(200);

			const blogsAtEnd = await helper.blogsInDB();
			const updatedBlog = blogsAtEnd.find(blog => blog.title === updateBlog.title);
			assert.deepStrictEqual(updateBlog, updatedBlog);
		});

		test('An Existing Blog\'s Author Can be Updated by its User', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				...blogsAtStart[0],
				author: 'Modified Author',
			};

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.put(`/api/blogs/${updateBlog.id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updateBlog)
				.expect(200);

			const blogsAtEnd = await helper.blogsInDB();
			const updatedBlog = blogsAtEnd.find(blog => blog.title === updateBlog.title);
			assert.deepStrictEqual(updateBlog, updatedBlog);
		});


		test('An Existing Blog\'s URL Can be Updated by its User', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				...blogsAtStart[0],
				url: 'ModifiedURL.com',
			};

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.put(`/api/blogs/${updateBlog.id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updateBlog)
				.expect(200);

			const blogsAtEnd = await helper.blogsInDB();
			const updatedBlog = blogsAtEnd.find(blog => blog.title === updateBlog.title);
			assert.deepStrictEqual(updateBlog, updatedBlog);
		});

		test('An Existing Blog\'s Likes Can be Updated by its User', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				...blogsAtStart[0],
				likes: 69,
			};

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.put(`/api/blogs/${updateBlog.id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updateBlog)
				.expect(200);

			const blogsAtEnd = await helper.blogsInDB();
			const updatedBlog = blogsAtEnd.find(blog => blog.title === updateBlog.title);
			assert.deepStrictEqual(updateBlog, updatedBlog);
		});

		test('An Existing Blog Can\'t be Updated if Provided Data is Invalid', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				id: blogsAtStart[0].id,
				title: 'Modified blog',
				url: 'modifiedUrl.com',
				likes: 69,
			};

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.put(`/api/blogs/${updateBlog.id}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updateBlog)
				.expect(400);
		});

		test('An Existing Blog Can\'t be Updated if JWT Token isn\'t Provided Returning status code 401', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				id: blogsAtStart[0].id,
				title: 'Modified blog',
				author: 'Modified Author',
				url: 'modifiedUrl.com',
				likes: 69,
			};

			await api
				.put(`/api/blogs/${updateBlog.id}`)
				.send(updateBlog)
				.expect(401);
		});

		test('An Existing Blog Can\'t be Updated if JWT Token Provided is Invalid Returning status code 401', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				id: blogsAtStart[0].id,
				title: 'Modified blog',
				author: 'Modified Author',
				url: 'modifiedUrl.com',
				likes: 69,
			};

			await api
				.put(`/api/blogs/${updateBlog.id}`)
				.set('Authorization', 'Bearer InvalidToken')
				.send(updateBlog)
				.expect(401);
		});

		test('Trying to Update Non Existing Blog Returns status code 404', async () => {
			const validNonExistingId = await helper.nonExistingId();
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				...blogsAtStart[0],
				likes: 69,
			};

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.put(`/api/blogs/${validNonExistingId}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updateBlog)
				.expect(404);
		});

		test('Trying to Update Blog w/ Invalid Id Returns status code 400', async () => {
			const invalidId = 'invalidId';
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				...blogsAtStart[0],
				likes: 69,
			};

			const { body: { token } } = await api
				.post('/api/login')
				.send({ username: 'root', password: 'secret' });

			await api
				.put(`/api/blogs/${invalidId}`)
				.set('Authorization', `Bearer ${token}`)
				.send(updateBlog)
				.expect(400);
		});
	});
});

after(async () => {
	await mongoose.connection.close();
});
