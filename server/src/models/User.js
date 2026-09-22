import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    passwordHash: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: 'user'
    },

    // Reputación — ver documentación de moderación para la fórmula.
    // Se recalcula desde el servidor, nunca se edita a mano.
    reputation: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    reportsReceived: {
      type: Number,
      default: 0
    },
    reportsConfirmed: {
      type: Number,
      default: 0
    },
    suspendedUntil: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true // añade createdAt y updatedAt automáticamente
  }
);

export const User = mongoose.model('User', userSchema);