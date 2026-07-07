const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  forumId: {
    type: String,
    unique: true,
    index: true
  },
  forumName: {
    type: String,
    required: true,
    trim: true
  },
  forumDesc: {
    type: String,
    default: ''
  },
  forumRules: {
    type: String,
    default: ''
  },
  forumAdmins: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Forum', forumSchema);
