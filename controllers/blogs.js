const blogsRouter = require('express').Router();
const Blog = require('../models/blogs');

blogsRouter.get('/', async (_request, response, next) => {
	try {
		const blogs = await Blog.find({});
		response.json(blogs)
	} catch (err) {
		next(err)
	}
});

blogsRouter.post('/', async (request, response, next) => {
	const { title, author, url, likes } = request.body;

	if (!title || !author || !url || !likes) {
		return response.status(400).json({
			error: 'Data Missing'
		});
	}

	const newBlog = new Blog({
		title,
		author,
		url,
		likes,
	});

	try {
		const savedBlog = await newBlog.save();
		response.status(201).json(savedBlog)
	} catch (err) {
		next(err)
	}
});

blogsRouter.get('/:id', async (request, response, next) => {
	const blogId = request.params.id;
	try {
		const blog = await Blog.findById(blogId);

		if (blog) {
			response.json(blog)
		} else {
			response.status(404).end();
		}

	} catch (err) {
		next(err)
	}
});

module.exports = blogsRouter;
