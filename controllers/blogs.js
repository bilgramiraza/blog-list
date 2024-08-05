const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (_request, response) => {
	const blogs = await Blog.find({});
	response.json(blogs)
});

blogsRouter.post('/', async (request, response) => {
	const { title, author, url, likes } = request.body;

	if (!title || !author || !url) {
		return response.status(400).json({
			error: 'Data Missing'
		});
	}

	const newBlog = new Blog({
		title,
		author,
		url,
		likes: likes || 0,
	});

	const savedBlog = await newBlog.save();
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

blogsRouter.delete('/:id', async (request, response) => {
	const blogId = request.params.id;
	await Blog.findByIdAndDelete(blogId);
	response.status(204).end();
});

blogsRouter.put('/:id', async (request, response) => {
	const blogId = request.params.id;
	const modifiedBlog = request.body;

	if (!modifiedBlog.title || !modifiedBlog.author || !modifiedBlog.url || !modifiedBlog.likes) {
		return response.status(400).end();
	}

	const updateOptions = {
		new: true,
		runValidators: true,
		context: 'query',
	};

	const updatedBlog = await Blog.findByIdAndUpdate(blogId, modifiedBlog, updateOptions);

	if (!updatedBlog) {
		return response.status(404).end();
	}

	response.status(200).json(updatedBlog);
});

module.exports = blogsRouter;
