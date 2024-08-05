const { describe, test, after, beforeEach } = require('node:test');
const assert = require('node:assert');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const Blog = require('../models/blog');
const User = require('../models/user');
const helper = require('./test_helper');
const bcrypt = require('bcrypt');

const api = supertest(app);

describe('API Tests when there are some notes saved', () => {
	beforeEach(async () => {
		await Blog.deleteMany({});
		await Blog.insertMany(helper.initialBlogs);
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

		test('Invalid Blog Won\'t be added and returns Status code 400', async () => {
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
			assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length - 1);

			const idsAtEnd = blogsAtEnd.map(blog => blog.id);
			assert(!idsAtEnd.includes(blogToDelete.id));
		});

		test('An non Existing Blog\'s Id returns 204 with Nothing Deleted', async () => {
			const validNonExistingId = await helper.nonExistingId();

			await api
				.delete(`/api/blogs/${validNonExistingId}`)
				.expect(204);

			const blogsAtEnd = await helper.blogsInDB();
			assert.strictEqual(blogsAtEnd.length, helper.initialBlogs.length);
		});

		test('An Invalid Id being Deleted returns 400', async () => {
			const invalidId = 'invalidId';

			await api
				.delete(`/api/blogs/${invalidId}`)
				.expect(400);
		});
	});

	describe('API Update Operations', () => {
		test('An Existing Blog\'s Title Can be Updated', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				...blogsAtStart[0],
				title: 'Modified blog',
			};

			await api
				.put(`/api/blogs/${updateBlog.id}`)
				.send(updateBlog)
				.expect(200);

			const blogsAtEnd = await helper.blogsInDB();
			const updatedBlog = blogsAtEnd.find(blog => blog.title === updateBlog.title);
			assert.deepStrictEqual(updateBlog, updatedBlog);
		});

		test('An Existing Blog\'s Author Can be Updated', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				...blogsAtStart[0],
				author: 'Modified Author',
			};

			await api
				.put(`/api/blogs/${updateBlog.id}`)
				.send(updateBlog)
				.expect(200);

			const blogsAtEnd = await helper.blogsInDB();
			const updatedBlog = blogsAtEnd.find(blog => blog.title === updateBlog.title);
			assert.deepStrictEqual(updateBlog, updatedBlog);
		});


		test('An Existing Blog\'s URL Can be Updated', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				...blogsAtStart[0],
				url: 'ModifiedURL.com',
			};

			await api
				.put(`/api/blogs/${updateBlog.id}`)
				.send(updateBlog)
				.expect(200);

			const blogsAtEnd = await helper.blogsInDB();
			const updatedBlog = blogsAtEnd.find(blog => blog.title === updateBlog.title);
			assert.deepStrictEqual(updateBlog, updatedBlog);
		});

		test('An Existing Blog\'s Likes Can be Updated', async () => {
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				...blogsAtStart[0],
				likes: 69,
			};

			await api
				.put(`/api/blogs/${updateBlog.id}`)
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

			await api
				.put(`/api/blogs/${updateBlog.id}`)
				.send(updateBlog)
				.expect(400);
		});

		test('Trying to Update Non Existing Blog Returns status code 404', async () => {
			const validNonExistingId = await helper.nonExistingId();
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				...blogsAtStart[0],
			};

			await api
				.put(`/api/blogs/${validNonExistingId}`)
				.send(updateBlog)
				.expect(404);
		});

		test('Trying to Update Blog w/ Invalid Id Returns status code 400', async () => {
			const invalidId = 'invalidId';
			const blogsAtStart = await helper.blogsInDB();
			const updateBlog = {
				...blogsAtStart[0],
			};
			await api
				.put(`/api/blogs/${invalidId}`)
				.send(updateBlog)
				.expect(400);
		});
	});
});

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
