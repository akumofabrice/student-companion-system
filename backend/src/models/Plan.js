const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  planId: { 
    type: String, 
    unique: true, 
    index: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  planDescription: { 
    type: String, 
    required: true 
  },
  planStart: { 
    type: Date, 
    required: true 
  },
  planEnd: { 
    type: Date, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'ongoing', 'completed'], 
    default: 'pending' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

planSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Plan', planSchema);
