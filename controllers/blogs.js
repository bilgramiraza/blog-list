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
	const body = request.body;

	const newBlog = new Blog({
		title: body.title,
		author: body.author,
		url: body.url,
		likes: body.likes,
	});

	try {
		const savedBlog = await newBlog.save();
		response.status(201).json(savedBlog)
	} catch (err) {
		next(err)
	}
});

module.exports = blogsRouter;
