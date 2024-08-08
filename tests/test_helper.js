const Blog = require('../models/blog');
const User = require('../models/user');

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

const getInitialBlogs = userId => {
	return initialBlogs.map(blog => ({ ...blog, user: userId }));
};

const nonExistingId = async () => {

	const blog = new Blog(
		{
			title: 'ToBeDeleted',
			author: 'ToBeDeleted',
			url: 'ToBeDeleted.com',
			likes: 404,
		});

	await blog.save();
	await blog.deleteOne();

	return blog.id;
};

const blogsInDB = async () => {
	const blogs = await Blog.find({});
	return blogs.map(blog => blog.toJSON());
};

const usersInDB = async () => {
	const users = await User.find({});
	return users.map(user => user.toJSON());
};

module.exports = {
	initialBlogs,
	getInitialBlogs,
	nonExistingId,
	blogsInDB,
	usersInDB,
};
