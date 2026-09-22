import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      required: true,
      enum: ['fuente_falsa', 'spam', 'insulto', 'irrelevante', 'otro']
    },
    note: {
      type: String,
      trim: true,
      maxlength: 300
    }
  },
  {
    timestamps: true
  }
);

// Red de seguridad — el control real de "ya reportaste esto" es un
// findOne previo en el controlador (mismo patrón que el email/username
// duplicado en authController.register), no capturar el error 11000.
reportSchema.index({ postId: 1, reporterId: 1 }, { unique: true });

export const Report = mongoose.model('Report', reportSchema);
