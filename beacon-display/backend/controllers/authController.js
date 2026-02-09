const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT Token with role
const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { email, password, name, role = 'user' } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate role
    if (!['admin', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Create user
    const userCount = await User.countDocuments();
    console.log('User count:', userCount);
    const userRole = userCount === 0 ? 'admin' : role; // First user is always admin
    const isApproved = userCount === 0 || userRole === 'user'; // First user OR regular users are auto-approved
    const isSuperAdmin = userCount === 0; // Only first user is super admin
    console.log('Creating user with role:', userRole, 'isApproved:', isApproved, 'isSuperAdmin:', isSuperAdmin);

    const user = new User({
      email,
      password,
      name,
      role: userRole,
      isApproved,
      isSuperAdmin,
    });

    await user.save();

    // Only generate token if approved (auto-approved for regular users)
    if (!isApproved) {
      return res.status(201).json({
        message: 'Registration successful. Your admin account is pending approval.',
        pendingApproval: true,
        _id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isSuperAdmin: user.isSuperAdmin,
      });
    }

    // Generate token for approved users
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isApproved: user.isApproved,
      isSuperAdmin: user.isSuperAdmin,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is approved
    if (!user.isApproved) {
      return res.status(403).json({ 
        message: 'Admin access pending approval. Please contact the administrator.',
        pendingApproval: true,
        role: user.role,
      });
    }

    // Generate token
    const token = generateToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      isApproved: user.isApproved,
      isSuperAdmin: user.isSuperAdmin,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    res.json({
      _id: req.user._id,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      isApproved: req.user.isApproved,
      isSuperAdmin: req.user.isSuperAdmin,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
