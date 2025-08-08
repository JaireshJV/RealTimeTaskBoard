const express = require('express');
const { body, validationResult } = require('express-validator');
const Board = require('../models/Board');
const Workspace = require('../models/Workspace');
const Card = require('../models/Card');

const router = express.Router();

// @route   GET /api/boards
// @desc    Get all boards for current user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { workspaceId } = req.query;
    
    let query = {};
    
    if (workspaceId) {
      // Check if user has access to this workspace
      const workspace = await Workspace.findOne({
        _id: workspaceId,
        $or: [
          { owner: req.user.userId },
          { 'members.user': req.user.userId }
        ]
      });
      
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found or access denied' });
      }
      
      query.workspace = workspaceId;
    } else {
      // Get boards from all accessible workspaces
      const accessibleWorkspaces = await Workspace.find({
        $or: [
          { owner: req.user.userId },
          { 'members.user': req.user.userId }
        ]
      }).select('_id');
      
      query.workspace = { $in: accessibleWorkspaces.map(w => w._id) };
    }

    const boards = await Board.find(query)
      .populate('workspace', 'name color')
      .populate('owner', 'username email avatar')
      .sort({ updatedAt: -1 });

    res.json({ boards });
  } catch (error) {
    console.error('Get boards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/boards
// @desc    Create a new board
// @access  Private
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('workspace')
    .isMongoId()
    .withMessage('Valid workspace ID is required'),
  body('background')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Background must be a valid hex color')
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

    const { name, description, workspace: workspaceId, background } = req.body;

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: workspaceId,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    });

    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found or access denied' });
    }

    const board = new Board({
      name,
      description: description || '',
      workspace: workspaceId,
      owner: req.user.userId,
      background: background || '#FFFFFF'
    });

    await board.save();

    const populatedBoard = await board.populate([
      { path: 'workspace', select: 'name color' },
      { path: 'owner', select: 'username email avatar' }
    ]);

    res.status(201).json({
      message: 'Board created successfully',
      board: populatedBoard
    });

  } catch (error) {
    console.error('Create board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/boards/:id
// @desc    Get board by ID with all cards
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const board = await Board.findOne({
      _id: req.params.id
    }).populate('workspace', 'name color')
      .populate('owner', 'username email avatar');

    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: board.workspace._id,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all cards for this board
    const cards = await Card.find({ board: board._id })
      .populate('createdBy', 'username email avatar')
      .populate('assignedTo', 'username email avatar')
      .populate('completedBy', 'username email avatar')
      .sort({ order: 1 });

    // Group cards by list
    const cardsByList = {};
    cards.forEach(card => {
      if (!cardsByList[card.list]) {
        cardsByList[card.list] = [];
      }
      cardsByList[card.list].push(card);
    });

    res.json({ 
      board,
      cards: cardsByList
    });

  } catch (error) {
    console.error('Get board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/boards/:id
// @desc    Update board
// @access  Private
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Board name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  body('background')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Background must be a valid hex color')
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

    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: board.workspace,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, description, background, isArchived } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (background !== undefined) updateData.background = background;
    if (isArchived !== undefined) updateData.isArchived = isArchived;

    const updatedBoard = await Board.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('workspace', 'name color')
     .populate('owner', 'username email avatar');

    res.json({
      message: 'Board updated successfully',
      board: updatedBoard
    });

  } catch (error) {
    console.error('Update board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/boards/:id
// @desc    Delete board
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: board.workspace,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId, 'members.role': 'admin' }
      ]
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Delete all cards in this board
    await Card.deleteMany({ board: board._id });

    // Delete the board
    await Board.findByIdAndDelete(req.params.id);

    res.json({ message: 'Board deleted successfully' });

  } catch (error) {
    console.error('Delete board error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/boards/:id/lists
// @desc    Add a new list to board
// @access  Private
router.post('/:id/lists', [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('List name must be between 1 and 50 characters'),
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

    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: board.workspace,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { name, color } = req.body;
    const newOrder = Math.max(...board.lists.map(list => list.order), -1) + 1;

    board.lists.push({
      name,
      order: newOrder,
      color: color || '#6B7280'
    });

    await board.save();

    res.json({
      message: 'List added successfully',
      board
    });

  } catch (error) {
    console.error('Add list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/boards/:id/lists/:listId
// @desc    Update a list in board
// @access  Private
router.put('/:id/lists/:listId', [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('List name must be between 1 and 50 characters'),
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

    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: board.workspace,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const { name, color } = req.body;
    if (name !== undefined) list.name = name;
    if (color !== undefined) list.color = color;

    await board.save();

    res.json({
      message: 'List updated successfully',
      board
    });

  } catch (error) {
    console.error('Update list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/boards/:id/lists/:listId
// @desc    Delete a list from board
// @access  Private
router.delete('/:id/lists/:listId', async (req, res) => {
  try {
    const board = await Board.findById(req.params.id);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

    // Check if user has access to the workspace
    const workspace = await Workspace.findOne({
      _id: board.workspace,
      $or: [
        { owner: req.user.userId },
        { 'members.user': req.user.userId }
      ]
    });

    if (!workspace) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const list = board.lists.id(req.params.listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Delete all cards in this list
    await Card.deleteMany({ 
      board: board._id, 
      list: req.params.listId 
    });

    // Remove the list
    board.lists.pull(req.params.listId);
    await board.save();

    res.json({
      message: 'List deleted successfully',
      board
    });

  } catch (error) {
    console.error('Delete list error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 