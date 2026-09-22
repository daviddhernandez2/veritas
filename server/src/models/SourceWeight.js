import mongoose from 'mongoose';

const sourceWeightSchema = new mongoose.Schema({
  sourceType: {
    type: String,
    required: true,
    unique: true,
    enum: ['paper', 'institucion', 'medio', 'libro', 'blog', 'youtube', 'instagram', 'red_social', 'otro']
  },
  weight: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  }
});

export const SourceWeight = mongoose.model('SourceWeight', sourceWeightSchema);