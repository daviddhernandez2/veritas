import mongoose from 'mongoose';

const appealSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    // Sin 'accepted'/'rejected' todavía — no hay moderador humano que
    // las resuelva hasta una fase posterior. No se construyen estados
    // que ningún flujo puede alcanzar.
    status: {
      type: String,
      enum: ['pending'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// Una apelación por post — igual que en Report, el control real es un
// findOne previo en el controlador.
appealSchema.index({ postId: 1 }, { unique: true });

export const Appeal = mongoose.model('Appeal', appealSchema);
