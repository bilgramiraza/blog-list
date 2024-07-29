const dummy = (_blogs) => {
	return 1;
};

const totalLikes = (blogs) => {
	const total = blogs.reduce((sum, blog) => sum + blog.likes, 0);
	return total;
};

module.exports = {
	dummy, totalLikes
};
