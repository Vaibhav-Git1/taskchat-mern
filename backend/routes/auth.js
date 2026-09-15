const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

const signToken = (user) =>
  jwt.sign(
    { id: user._id, name: user.name, email: user.email },
    process.env.JWT_SECRET || 'secret123',
    { expiresIn: '7d' }
  );

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ msg: 'All fields are required' });
    if (await User.findOne({ email }))
      return res.status(400).json({ msg: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed });
    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(400).json({ msg: 'Invalid credentials' });
    res.json({
      token: signToken(user),
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

// Get all users except current user (for task assignment)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.user.id } }, 'name email _id');
    res.json(users);
  } catch {
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;
