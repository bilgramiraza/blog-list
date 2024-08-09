const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const middleware = require('../utils/middleware');

blogsRouter.get('/', async (_request, response) => {
	const blogs = await Blog
		.find({})
		.populate('user', { username: 1, name: 1 });

	response.json(blogs)
});

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
	const { title, author, url, likes } = request.body;

	if (!title || !author || !url) {
		return response.status(400).json({
			error: 'Data Missing'
		});
	}

	const user = request.user;

	const newBlog = new Blog({
		title,
		author,
		url,
		likes: likes || 0,
		user: user.id,
	});

	const savedBlog = await newBlog.save();
	user.blogs = user.blogs.concat(savedBlog._id);
	await user.save();

	response.status(201).json(savedBlog)
});

blogsRouter.get('/:id', async (request, response) => {
	const blogId = request.params.id;
	const blog = await Blog.findById(blogId);

	if (blog) {
		response.json(blog)
	} else {
		response.status(404).end();
	}
});

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
	const blogId = request.params.id;

	const user = request.user;
	const blog = await Blog.findById(blogId);

	if (!blog) {
		response.status(204).end();
	}

	if (blog.user.toString() !== user.id) {
		return response.status(401).json({ error: 'Unauthorized Access' });
	}

	await Blog.findByIdAndDelete(blogId);
	response.status(204).end();
});

blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
	const blogId = request.params.id;
	const modifiedBlog = request.body;

	if (!modifiedBlog.title || !modifiedBlog.author || !modifiedBlog.url || !modifiedBlog.likes) {
		return response.status(400).end();
	}

	const blog = await Blog.findById(blogId);
	const user = request.user;

	if (!blog) {
		return response.status(404).end();
	}

	if (blog.user.toString() !== user.id) {
		return response.status(401).json({ error: 'Unauthorized Access' });
	}

	const updateOptions = {
		new: true,
		runValidators: true,
		context: 'query',
	};

	const updatedBlog = await Blog.findByIdAndUpdate(blogId, modifiedBlog, updateOptions);

	response.status(200).json(updatedBlog);
});

module.exports = blogsRouter;
