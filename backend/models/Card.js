const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const attachmentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  size: {
    type: Number
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: ''
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  order: {
    type: Number,
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  labels: [{
    name: {
      type: String,
      trim: true,
      maxlength: 20
    },
    color: {
      type: String,
      default: '#6B7280'
    }
  }],
  comments: [commentSchema],
  attachments: [attachmentSchema],
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  estimatedHours: {
    type: Number,
    min: 0
  },
  actualHours: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
cardSchema.index({ board: 1, list: 1 });
cardSchema.index({ board: 1, order: 1 });
cardSchema.index({ assignedTo: 1 });
cardSchema.index({ dueDate: 1 });

// Virtual for checking if card is overdue
cardSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate || this.isCompleted) return false;
  return new Date() > this.dueDate;
});

// Method to move card to different list
cardSchema.methods.moveToList = function(newListId, newOrder) {
  this.list = newListId;
  this.order = newOrder;
  return this.save();
};

// Method to add comment
cardSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content
  });
  return this.save();
};

// Method to assign user
cardSchema.methods.assignUser = function(userId) {
  if (!this.assignedTo.includes(userId)) {
    this.assignedTo.push(userId);
  }
  return this.save();
};

// Method to unassign user
cardSchema.methods.unassignUser = function(userId) {
  this.assignedTo = this.assignedTo.filter(id => id.toString() !== userId.toString());
  return this.save();
};

module.exports = mongoose.model('Card', cardSchema); 