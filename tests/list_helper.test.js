const { test, describe } = require('node:test');
const assert = require('node:assert');
const listHelper = require('../utils/list_helper');

const blogs = [
	{
		_id: "5a422a851b54a676234d17f7",
		title: "React patterns",
		author: "Michael Chan",
		url: "https://reactpatterns.com/",
		likes: 7,
		__v: 0
	},
	{
		_id: "5a422aa71b54a676234d17f8",
		title: "Go To Statement Considered Harmful",
		author: "Edsger W. Dijkstra",
		url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html",
		likes: 5,
		__v: 0
	},
	{
		_id: "5a422b3a1b54a676234d17f9",
		title: "Canonical string reduction",
		author: "Edsger W. Dijkstra",
		url: "http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html",
		likes: 12,
		__v: 0
	},
	{
		_id: "5a422b891b54a676234d17fa",
		title: "First class tests",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
		likes: 10,
		__v: 0
	},
	{
		_id: "5a422ba71b54a676234d17fb",
		title: "TDD harms architecture",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html",
		likes: 0,
		__v: 0
	},
	{
		_id: "5a422bc61b54a676234d17fc",
		title: "Type wars",
		author: "Robert C. Martin",
		url: "http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html",
		likes: 2,
		__v: 0
	},
];

test('Dummy returns One', () => {
	const result = listHelper.dummy([]);
	assert.strictEqual(result, 1);
});

describe('Total Likes', () => {

	test('of Empty List is Zero', () => {
		const result = listHelper.totalLikes([]);
		assert.strictEqual(result, 0);
	});

	test('when list has only one blog equals the likes of that', () => {
		const result = listHelper.totalLikes([blogs[0]]);
		assert.strictEqual(result, 7);
	});
	test('of a bigger list is calculated right', () => {
		const result = listHelper.totalLikes(blogs);
		assert.strictEqual(result, 36);
	});
});

describe('Favorite Blog', () => {
	test('of Empty List is an Empty Object', () => {
		const result = listHelper.favoriteBlog([]);
		const favoriteBlog = {
			title: '',
			author: '',
			likes: 0,
		};
		assert.deepStrictEqual(result, favoriteBlog);
	});

	test('when list has only one blog, Return itself', () => {
		const result = listHelper.favoriteBlog([blogs[0]]);
		const favoriteBlog = {
			title: "React patterns",
			author: "Michael Chan",
			likes: 7,
		};
		assert.deepStrictEqual(result, favoriteBlog);
	});
	test('of a bigger list of blogs', () => {
		const result = listHelper.favoriteBlog(blogs);
		const favoriteBlog = {
			title: "Canonical string reduction",
			author: "Edsger W. Dijkstra",
			likes: 12,
		};
		assert.deepStrictEqual(result, favoriteBlog);
	});
});

describe('Most Blogs Per Author', () => {
	test('of Empty List is an Empty Object', () => {
		const result = listHelper.mostBlogs([]);
		const expectedObject = {
			author: '',
			blogs: 0,
		};
		assert.deepStrictEqual(result, expectedObject);
	});

	test('when list has only one blog, Return Author with 1 Blog', () => {
		const result = listHelper.mostBlogs([blogs[0]]);
		const expectedObject = {
			author: 'Michael Chan',
			blogs: 1,
		};
		assert.deepStrictEqual(result, expectedObject);
	});
	test('of a bigger list of blogs', () => {
		const result = listHelper.mostBlogs(blogs);
		const expectedObject = {
			author: 'Robert C. Martin',
			blogs: 3,
		};
		assert.deepStrictEqual(result, expectedObject);
	});
});

describe('Most Likes Per Author', () => {
	test('of Empty List is an Empty Object', () => {
		const result = listHelper.mostLikes([]);
		const expectedObject = {
			author: '',
			likes: 0,
		};
		assert.deepStrictEqual(result, expectedObject);
	});

	test('when list has only one blog, Return Author with Likes of 1 Blog', () => {
		const result = listHelper.mostLikes([blogs[0]]);
		const expectedObject = {
			author: 'Michael Chan',
			likes: 7,
		};
		assert.deepStrictEqual(result, expectedObject);
	});
	test('of a bigger list of blogs', () => {
		const result = listHelper.mostLikes(blogs);
		const expectedObject = {
			author: 'Edsger W. Dijkstra',
			likes: 17,
		};
		assert.deepStrictEqual(result, expectedObject);
	});
});
