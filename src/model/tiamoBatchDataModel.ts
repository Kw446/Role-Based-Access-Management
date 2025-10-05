import mongoose from 'mongoose';
 
const TiamoBatchDataPdf = new mongoose.Schema({
  instrument_id: {
    type: String,
    default: null,
  },
  method_name: {
    type: String,
    default: null,
  },
  sample_name: {
    type: String,
    default: null,
  },
  batch_no: {
    type: String,
    default: null,
  },
  condition: {
    type: String,
    default: null,
  },
   sample_size: {
    type: String,
    default: null,
  },
   determination_start_datetime: {
    type: String,
    default: null,
  },
  analyst_user_name: {
    type: String,
    default: null,
  },
  water_content: {
    type: String,
    default: null,
  },
  determination_signature_level_1: {
    type: String,
    default: null,
  },
  determination_signature_level_2: {
    type: String,
    default: null,
  },
  start_counter_no: {
    type: String,
    default: null,
  },
  critical_events: {
    type: String,
    default: null,
  },
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
    default: Date.now()
  },
  updated_at: {
    type: Date,
    default: null,
  },
});
 
export const TiamoBatchDataPdfSchema = mongoose.model('TiamoBatchDataPdf', TiamoBatchDataPdf);
 
 