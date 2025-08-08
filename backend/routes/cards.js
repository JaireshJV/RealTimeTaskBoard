const express = require('express');
const { body, validationResult } = require('express-validator');
const Card = require('../models/Card');
const Board = require('../models/Board');
const Workspace = require('../models/Workspace');

const router = express.Router();

// @route   GET /api/cards
// @desc    Get all cards for a board
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { boardId } = req.query;
    
    if (!boardId) {
      return res.status(400).json({ message: 'Board ID is required' });
    }

    // Check if user has access to the board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

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

    const cards = await Card.find({ board: boardId })
      .populate('createdBy', 'username email avatar')
      .populate('assignedTo', 'username email avatar')
      .populate('completedBy', 'username email avatar')
      .sort({ order: 1 });

    res.json({ cards });
  } catch (error) {
    console.error('Get cards error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cards
// @desc    Create a new card
// @access  Private
router.post('/', [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Card title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('board')
    .isMongoId()
    .withMessage('Valid board ID is required'),
  body('list')
    .isMongoId()
    .withMessage('Valid list ID is required'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent')
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

    const { title, description, board: boardId, list: listId, dueDate, priority, assignedTo } = req.body;

    // Check if user has access to the board
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

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

    // Check if list exists in the board
    const list = board.lists.id(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Get the highest order in the list
    const maxOrder = await Card.findOne({ board: boardId, list: listId })
      .sort({ order: -1 })
      .select('order');
    
    const newOrder = (maxOrder ? maxOrder.order : -1) + 1;

    const card = new Card({
      title,
      description: description || '',
      board: boardId,
      list: listId,
      order: newOrder,
      createdBy: req.user.userId,
      assignedTo: assignedTo || [],
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || 'medium'
    });

    await card.save();

    const populatedCard = await card.populate([
      { path: 'createdBy', select: 'username email avatar' },
      { path: 'assignedTo', select: 'username email avatar' }
    ]);

    res.status(201).json({
      message: 'Card created successfully',
      card: populatedCard
    });

  } catch (error) {
    console.error('Create card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/cards/:id
// @desc    Get card by ID
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id)
      .populate('createdBy', 'username email avatar')
      .populate('assignedTo', 'username email avatar')
      .populate('completedBy', 'username email avatar')
      .populate('comments.user', 'username email avatar');

    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

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

    res.json({ card });
  } catch (error) {
    console.error('Get card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cards/:id
// @desc    Update card
// @access  Private
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Card title must be between 1 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description must be less than 2000 characters'),
  body('dueDate')
    .optional()
    .isISO8601()
    .withMessage('Due date must be a valid date'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high', 'urgent'])
    .withMessage('Priority must be low, medium, high, or urgent')
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

    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

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

    const { title, description, dueDate, priority, labels, estimatedHours, actualHours } = req.body;
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (priority !== undefined) updateData.priority = priority;
    if (labels !== undefined) updateData.labels = labels;
    if (estimatedHours !== undefined) updateData.estimatedHours = estimatedHours;
    if (actualHours !== undefined) updateData.actualHours = actualHours;

    const updatedCard = await Card.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'createdBy', select: 'username email avatar' },
      { path: 'assignedTo', select: 'username email avatar' },
      { path: 'completedBy', select: 'username email avatar' }
    ]);

    res.json({
      message: 'Card updated successfully',
      card: updatedCard
    });

  } catch (error) {
    console.error('Update card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cards/:id
// @desc    Delete card
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

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

    await Card.findByIdAndDelete(req.params.id);

    res.json({ message: 'Card deleted successfully' });

  } catch (error) {
    console.error('Delete card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cards/:id/move
// @desc    Move card to different list/position
// @access  Private
router.put('/:id/move', [
  body('listId')
    .isMongoId()
    .withMessage('Valid list ID is required'),
  body('order')
    .isInt({ min: 0 })
    .withMessage('Order must be a non-negative integer')
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

    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

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

    const { listId, order } = req.body;

    // Check if list exists in the board
    const list = board.lists.id(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    // Update card position
    card.list = listId;
    card.order = order;
    await card.save();

    const updatedCard = await card.populate([
      { path: 'createdBy', select: 'username email avatar' },
      { path: 'assignedTo', select: 'username email avatar' }
    ]);

    res.json({
      message: 'Card moved successfully',
      card: updatedCard
    });

  } catch (error) {
    console.error('Move card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cards/:id/assign
// @desc    Assign user to card
// @access  Private
router.post('/:id/assign', [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required')
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

    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

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

    const { userId } = req.body;

    // Check if user is already assigned
    if (card.assignedTo.includes(userId)) {
      return res.status(400).json({ message: 'User is already assigned to this card' });
    }

    await card.assignUser(userId);

    const updatedCard = await card.populate([
      { path: 'createdBy', select: 'username email avatar' },
      { path: 'assignedTo', select: 'username email avatar' }
    ]);

    res.json({
      message: 'User assigned successfully',
      card: updatedCard
    });

  } catch (error) {
    console.error('Assign user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/cards/:id/assign/:userId
// @desc    Unassign user from card
// @access  Private
router.delete('/:id/assign/:userId', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

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

    await card.unassignUser(req.params.userId);

    const updatedCard = await card.populate([
      { path: 'createdBy', select: 'username email avatar' },
      { path: 'assignedTo', select: 'username email avatar' }
    ]);

    res.json({
      message: 'User unassigned successfully',
      card: updatedCard
    });

  } catch (error) {
    console.error('Unassign user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/cards/:id/comments
// @desc    Add comment to card
// @access  Private
router.post('/:id/comments', [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters')
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

    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

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

    const { content } = req.body;

    await card.addComment(req.user.userId, content);

    const updatedCard = await card.populate([
      { path: 'createdBy', select: 'username email avatar' },
      { path: 'assignedTo', select: 'username email avatar' },
      { path: 'comments.user', select: 'username email avatar' }
    ]);

    res.json({
      message: 'Comment added successfully',
      card: updatedCard
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/cards/:id/complete
// @desc    Mark card as completed
// @access  Private
router.put('/:id/complete', async (req, res) => {
  try {
    const card = await Card.findById(req.params.id);
    if (!card) {
      return res.status(404).json({ message: 'Card not found' });
    }

    // Check if user has access to the board
    const board = await Board.findById(card.board);
    if (!board) {
      return res.status(404).json({ message: 'Board not found' });
    }

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

    card.isCompleted = !card.isCompleted;
    if (card.isCompleted) {
      card.completedAt = new Date();
      card.completedBy = req.user.userId;
    } else {
      card.completedAt = null;
      card.completedBy = null;
    }

    await card.save();

    const updatedCard = await card.populate([
      { path: 'createdBy', select: 'username email avatar' },
      { path: 'assignedTo', select: 'username email avatar' },
      { path: 'completedBy', select: 'username email avatar' }
    ]);

    res.json({
      message: card.isCompleted ? 'Card marked as completed' : 'Card marked as incomplete',
      card: updatedCard
    });

  } catch (error) {
    console.error('Complete card error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 