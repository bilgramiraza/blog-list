const dummy = (_blogs) => {
	return 1;
};

const totalLikes = (blogs) => {
	const total = blogs.reduce((sum, blog) => sum + blog.likes, 0);
	return total;
};

const favoriteBlog = (blogs) => {
	let favorite = {
		title: '',
		author: '',
		likes: 0,
	};

	if (!blogs.length) return favorite;

	blogs.forEach(blog => {
		if (blog.likes > favorite.likes)
			favorite = {
				title: blog.title,
				author: blog.author,
				likes: blog.likes,
			};
	});
	return favorite;
};

const mostBlogs = (blogs) => {
	if (!blogs.length) return { author: '', blogs: 0 };

	if (blogs.length === 1) return { author: blogs[0].author, blogs: 1 };

	let authorCount = {};
	let maxAuthor = '';
	let maxBlogs = 0;

	blogs.forEach(blog => {
		authorCount[blog.author] = (authorCount[blog.author] || 0) + 1;

		if (authorCount[blog.author] > maxBlogs) {
			maxBlogs = authorCount[blog.author];
			maxAuthor = blog.author;
		}
	});

	return { author: maxAuthor, blogs: maxBlogs };
};

const mostLikes = (blogs) => {
	if (!blogs.length) return { author: '', likes: 0 };

	if (blogs.length === 1) return { author: blogs[0].author, likes: blogs[0].likes };

	let authorCount = {};
	let maxAuthor = '';
	let maxLikes = 0;

	blogs.forEach(blog => {
		authorCount[blog.author] = (authorCount[blog.author] || 0) + blog.likes;

		if (authorCount[blog.author] > maxLikes) {
			maxLikes = authorCount[blog.author];
			maxAuthor = blog.author;
		}
	});

	return { author: maxAuthor, likes: maxLikes };
};

module.exports = {
	dummy,
	totalLikes,
	favoriteBlog,
	mostBlogs,
	mostLikes,
};
