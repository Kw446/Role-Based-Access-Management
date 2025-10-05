import mongoose from 'mongoose';

export const labSolutionsBatchData = new mongoose.Schema({

  analyst: { type: String, default: null },
  Wave_length: { type: String, default: null },
  version: { type: String, default: null },
  print_date: { type: String, default: null },
  project_name: { type: String, default: null },
  date_no: { type: String, default: null },
  data_file_name: { type: String, default: null },
  confirmer_analyst: { type: String, default: null },
  reviewer_analyst: { type: String, default: null },
  data_file_comments: { type: [String], default: [] },

  samples: [{
    sampleId: { type: String, default: null },
    date: { type: String, default: null },
    time: { type: String, default: null },
    wl280: { type: Number, default: null },
    comments: { type: String, default: null },
  }],
   pdf_file_url: {
      type: String
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
}, { timestamps: true });

export const labSolutionsBatchDataSchema = mongoose.model('labSolutionsBatchData', labSolutionsBatchData);
