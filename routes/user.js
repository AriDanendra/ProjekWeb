const express = require('express');
const router = express.Router();
const User = require('../models/user');

// GET semua user
router.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// POST user baru
router.post('/', async (req, res) => {
  const user = await User.create(req.body);
  res.json(user);
});

module.exports = router;
