const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');

usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body;

  if (!password || password.length < 3) {
    response.status(400).send({ error: 'Password too short(Min 3)' });
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = new User({
    username,
    name,
    passwordHash
  });

  const savedUser = await user.save();

  response.status(201).json(savedUser);
});

// Returns All Users w/ the number of blogs under each
// Moved to use 'Aggregate' rather than a transformation using 'map'
// since 'Aggregate' is more scalable
usersRouter.get('/', async (_request, response) => {
  const users = await User.aggregate([
    {
      $project: {
        _id: 1,
        username: 1,
        blogs: { $size: '$blogs' }
      }
    }
  ]);
  response.json(users);
});

module.exports = usersRouter;
