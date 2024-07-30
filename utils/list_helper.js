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

module.exports = {
	dummy, totalLikes, favoriteBlog
};
