import mongoose from 'mongoose';
 
const TiamoDataAuditTrialLogs = new mongoose.Schema({
  type: {
    type: String,
    default: null,
  },
  date: {
    type: String,
    default: null,
  },
  user: {
    type: String,
    default: null,
  },
  client: {
    type: String,
    default: null,
  },
  category: {
    type: String,
    default: null,
  },
  full_name: {
    type: String,
    default: null,
  },
  action: {
    type: String,
    default: null,
  },
  details: {
    type: String,
    default: null,
  },
  archived: {
    type: String,
    default: false,
  },
  status: {
    type: String,
    default: 'active',
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  updated_by: {
    type: mongoose.Schema.Types.ObjectId,
    default: null,
  },
  created_at: {
    type: Date,
    default: Date.now()
  },
  updated_at: {
    type: Date,
    default: null,
  },
});
 
export const TiamoDataAuditTrialLogschema = mongoose.model('TiamoDataAuditTrialLogs', TiamoDataAuditTrialLogs);
 
 