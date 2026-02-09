const User = require('../models/User');

// Get all pending admin approvals
exports.getPendingApprovals = async (req, res) => {
  try {
    const pendingAdmins = await User.find({
      role: 'admin',
      isApproved: false,
    }).select('-password');

    res.json({
      message: 'Pending admin approvals retrieved',
      count: pendingAdmins.length,
      users: pendingAdmins,
    });
  } catch (error) {
    console.error('Get pending approvals error:', error);
    res.status(500).json({ message: 'Failed to retrieve pending approvals' });
  }
};

// Get all approved admins
exports.getApprovedAdmins = async (req, res) => {
  try {
    const approvedAdmins = await User.find({
      role: 'admin',
      isApproved: true,
    }).select('-password');

    res.json({
      message: 'Approved admins retrieved',
      count: approvedAdmins.length,
      users: approvedAdmins,
    });
  } catch (error) {
    console.error('Get approved admins error:', error);
    res.status(500).json({ message: 'Failed to retrieve approved admins' });
  }
};

// Approve admin account
exports.approveAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Find the user to approve
    const userToApprove = await User.findById(adminId);
    if (!userToApprove) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is an admin
    if (userToApprove.role !== 'admin') {
      return res.status(400).json({ message: 'User is not an admin' });
    }

    // Check if already approved
    if (userToApprove.isApproved) {
      return res.status(400).json({ message: 'User is already approved' });
    }

    // Update user approval status
    userToApprove.isApproved = true;
    userToApprove.approvedAt = new Date();
    userToApprove.approvedBy = req.user._id;

    await userToApprove.save();

    res.json({
      message: 'Admin account approved successfully',
      user: {
        _id: userToApprove._id,
        email: userToApprove.email,
        name: userToApprove.name,
        role: userToApprove.role,
        isApproved: userToApprove.isApproved,
        approvedAt: userToApprove.approvedAt,
      },
    });
  } catch (error) {
    console.error('Approve admin error:', error);
    res.status(500).json({ message: 'Failed to approve admin account' });
  }
};

// Reject admin account
exports.rejectAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Find the user to reject
    const userToReject = await User.findById(adminId);
    if (!userToReject) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is an admin
    if (userToReject.role !== 'admin') {
      return res.status(400).json({ message: 'User is not an admin' });
    }

    // Check if already approved
    if (userToReject.isApproved) {
      return res.status(400).json({ message: 'User is already approved. Cannot reject.' });
    }

    // Delete the user
    await User.findByIdAndDelete(adminId);

    res.json({
      message: 'Admin account rejected and deleted',
      userId: adminId,
    });
  } catch (error) {
    console.error('Reject admin error:', error);
    res.status(500).json({ message: 'Failed to reject admin account' });
  }
};

// Get all users (with role filtering option)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    const query = {};
    if (role && ['admin', 'user'].includes(role)) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ created_at: -1 });

    res.json({
      message: 'Users retrieved',
      count: users.length,
      users,
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Failed to retrieve users' });
  }
};

// Remove admin privileges
exports.removeAdmin = async (req, res) => {
  try {
    const { adminId } = req.params;

    // Prevent removing the super admin
    const userToUpdate = await User.findById(adminId);
    if (!userToUpdate) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (userToUpdate.isSuperAdmin) {
      return res.status(403).json({ message: 'Cannot remove super admin privileges' });
    }

    // Prevent removing self
    if (adminId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot remove your own admin privileges' });
    }

    if (userToUpdate.role !== 'admin') {
      return res.status(400).json({ message: 'User is not an admin' });
    }

    // Convert to regular user
    userToUpdate.role = 'user';
    userToUpdate.isApproved = true;

    await userToUpdate.save();

    res.json({
      message: 'Admin privileges removed',
      user: {
        _id: userToUpdate._id,
        email: userToUpdate.email,
        name: userToUpdate.name,
        role: userToUpdate.role,
      },
    });
  } catch (error) {
    console.error('Remove admin error:', error);
    res.status(500).json({ message: 'Failed to remove admin privileges' });
  }
};
