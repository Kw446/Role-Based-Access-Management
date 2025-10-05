import mongoose from 'mongoose';

const UserAuthenticationLogs = new mongoose.Schema({
  type: {
    type: String,
    default: null,
  },
  date_time: {
    type: String,
    default: null,
  },
  code: {
    type: String,
    default: null,
  },
  user_name: {
    type: String,
    default: null,
  },
  project_name: {
    type: String,
    default: null,
  },
  application_name: {
    type: String,
    default: null,
  },
  instrument_name: {
    type: String,
    default: null,
  },
  pc_name: {
    type: String,
    default: null,
  },
  message: {
    type: String,
    default: null,
  },
  sub_message: {
    type: String,
    default: null,
  },
  file_id: {
    type: String,
    default: null,
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
    default: Date.now,
  },
    updated_at: {
      type: Date,
      default: null,
    },
});

export const userAuthenticationLogSchema = mongoose.model('UserAuthenticationLogs', UserAuthenticationLogs);
