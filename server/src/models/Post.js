import mongoose from 'mongoose';

const postSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      default: null
    },
    threadRootId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    },
    depth: {
      type: Number,
      required: true,
      default: 0
    },

    title: {
      type: String,
      trim: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000
    },

    // Distingue una bifurcación (nuevo subtema, declarado) de una
    // respuesta normal. Puramente descriptivo — no condiciona quién
    // puede responder, solo cómo se etiqueta y se muestra en las vistas.
    postType: {
      type: String,
      enum: ['reply', 'fork'],
      default: null
    },
    forkLabel: {
      type: String,
      trim: true,
      maxlength: 100,
      default: null
    },
    forkRationale: {
      type: String,
      trim: true,
      maxlength: 300,
      default: null
    },

    sourceType: {
      type: String,
      required: true,
      enum: ['paper', 'institucion', 'medio', 'libro', 'blog', 'youtube', 'instagram', 'red_social', 'otro']
    },
    sourceUrl: {
      type: String,
      trim: true
    },
    sourceWeight: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },

    reliabilityAgg: {
      type: Number,
      default: null
    },
    reliabilityUpdatedAt: {
      type: Date,
      default: null
    },

    childCount: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ['visible', 'hidden', 'removed'],
      default: 'visible'
    },
    reportCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

postSchema.index({ parentId: 1 });
postSchema.index({ threadRootId: 1 });
postSchema.index({ threadRootId: 1, depth: 1 });

export const Post = mongoose.model('Post', postSchema);