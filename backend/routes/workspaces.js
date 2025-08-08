const express = require('express');
const { body, validationResult } = require('express-validator');
const Workspace = require('../models/Workspace');
const Board = require('../models/Board');

const router = express.Router();

// @route   GET /api/workspaces
// @desc    Get all workspaces for current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    }).populate('owner', 'username email avatar')
      .populate('members.user', 'username email avatar')
      .sort({ updatedAt: -1 });

    res.json({ workspaces });
  } catch (error) {
    console.error('Get workspaces error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/workspaces
// @desc    Create a new workspace
// @access  Private
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Workspace name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const { name, description, color, isPublic } = req.body;

    const workspace = new Workspace({
      name,
      description: description || '',
      color: color || '#3B82F6',
      isPublic: isPublic || false,
      owner: req.user.userId,
      members: [{ user: req.user.userId, role: 'admin' }]
    });

    await workspace.save();

    const populatedWorkspace = await workspace.populate([
      { path: 'owner', select: 'username email avatar' },
      { path: 'members.user', select: 'username email avatar' }
    ]);

    res.status(201).json({
      message: 'Workspace created successfully',
      workspace: populatedWorkspace
    });

  } catch (error) {
    console.error('Create workspace error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/workspaces/:id
// @desc    Get workspace by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    }).populate('owner', 'username email avatar')
      .populate('members.user', 'username email avatar');

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Get boards for this workspace
    const boards = await Board.find({ workspace: workspace._id })
      .select('name description background isArchived createdAt')
      .sort({ updatedAt: -1 });

    res.json({ workspace, boards });
  } catch (error) {
    console.error('Get workspace error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/workspaces/:id
// @desc    Update workspace
// @access  Private
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Workspace name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found or access denied' });
    }

    const { name, description, color, isPublic } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const updatedWorkspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'username email avatar')
     .populate('members.user', 'username email avatar');

    res.json({
      message: 'Workspace updated successfully',
      workspace: updatedWorkspace
    });

  } catch (error) {
    console.error('Update workspace error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/workspaces/:id
// @desc    Delete workspace
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      owner: req.user.userId
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found or access denied' });
    }

    // Delete all boards in this workspace
    await Board.deleteMany({ workspace: workspace._id });

    // Delete the workspace
    await Workspace.findByIdAndDelete(req.params.id);

    res.json({ message: 'Workspace deleted successfully' });

  } catch (error) {
    console.error('Delete workspace error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/workspaces/:id/members
// @desc    Add member to workspace
// @access  Private
router.post('/:id/members', [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('role')
    .optional()
    .isIn(['admin', 'member', 'viewer'])
    .withMessage('Role must be admin, member, or viewer')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const workspace = await Workspace.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId, 'members.role': 'admin' }
      ]
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found or access denied' });
    }

    const { userId, role = 'member' } = req.body;

    // Check if user is already a member
    const existingMember = workspace.members.find(
      member => member.user.toString() === userId
    );

    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    workspace.members.push({ user: userId, role });
    await workspace.save();

    const populatedWorkspace = await workspace.populate([
      { path: 'owner', select: 'username email avatar' },
      { path: 'members.user', select: 'username email avatar' }
    ]);

    res.json({
      message: 'Member added successfully',
      workspace: populatedWorkspace
    });

  } catch (error) {
    console.error('Add member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/workspaces/:id/members/:userId
// @desc    Remove member from workspace
// @access  Private
router.delete('/:id/members/:userId', async (req, res) => {
  try {
    const workspace = await Workspace.findOne({
      _id: req.params.id,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId, 'members.role': 'admin' }
      ]
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found or access denied' });
    }

    // Cannot remove the owner
    if (workspace.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove workspace owner' });
    }

    // Remove member
    workspace.members = workspace.members.filter(
      member => member.user.toString() !== req.params.userId
    );

    await workspace.save();

    const populatedWorkspace = await workspace.populate([
      { path: 'owner', select: 'username email avatar' },
      { path: 'members.user', select: 'username email avatar' }
    ]);

    res.json({
      message: 'Member removed successfully',
      workspace: populatedWorkspace
    });

  } catch (error) {
    console.error('Remove member error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 