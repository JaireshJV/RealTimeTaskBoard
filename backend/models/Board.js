const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  order: {
    type: Number,
    required: true
  },
  color: {
    type: String,
    default: '#6B7280'
  }
}, { _id: true });

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
    default: ''
  },
  workspace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lists: [listSchema],
  background: {
    type: String,
    default: '#FFFFFF'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  settings: {
    allowComments: {
      type: Boolean,
      default: true
    },
    allowAttachments: {
      type: Boolean,
      default: true
    },
    allowAssignments: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
boardSchema.index({ workspace: 1 });
boardSchema.index({ owner: 1 });

// Pre-save middleware to ensure default lists exist
boardSchema.pre('save', function(next) {
  if (this.lists.length === 0) {
    this.lists = [
      { name: 'To Do', order: 0, color: '#EF4444' },
      { name: 'Doing', order: 1, color: '#F59E0B' },
      { name: 'Done', order: 2, color: '#10B981' }
    ];
  }
  next();
});

module.exports = mongoose.model('Board', boardSchema); 