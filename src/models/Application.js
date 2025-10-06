import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  cvUrl: {
    type: String,
    required: true,
  },
  cvPublicId: {
    type: String,
    required: true,
  },
  vacancyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vacancy',
    required: true,
  },
  // Elanı paylaşan şəxs
  vacancyOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // IP tracking
  ipAddress: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending',
  },
  appliedAt: {
    type: Date,
    default: Date.now,
  },
  // Owner-in oxuma statusu
  isReadByOwner: {
    type: Boolean,
    default: false,
  },
  readAt: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true
});

// Index-lər performans üçün
applicationSchema.index({ vacancyId: 1, ipAddress: 1 });
applicationSchema.index({ vacancyOwnerId: 1, status: 1 });
applicationSchema.index({ email: 1 });

// IP-yə görə müraciət sayını yoxlayan static method
applicationSchema.statics.countByIP = function(vacancyId, ipAddress) {
  return this.countDocuments({ vacancyId, ipAddress });
};

export default mongoose.model('Application', applicationSchema);