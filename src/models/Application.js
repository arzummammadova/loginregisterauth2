import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
//   username: {
//     type: String,
//     required: true,
//     trim: true,
//   },
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
});

export default mongoose.model('Application', applicationSchema);