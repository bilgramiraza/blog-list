const Blog = require('../models/blogs');

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

	return blog._id.toString();
};

const blogsInDB = async () => {
	const blogs = await Blog.find({});
	return blogs.map(blog => blog.toJSON());
};

module.exports = {
	initialBlogs,
	nonExistingId,
	blogsInDB,
};
