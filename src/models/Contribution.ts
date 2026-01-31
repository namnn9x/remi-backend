import mongoose, { Schema, Document } from 'mongoose';

export interface IContribution extends Document {
  memoryBookId: mongoose.Types.ObjectId;
  photoId: string; // ID của photo (có thể là filename hoặc ObjectId)
  url: string; // URL để load ảnh: /api/images/:filename
  note: string;
  prompt: string;
  contributedAt: Date;
}

const ContributionSchema = new Schema<IContribution>({
  memoryBookId: { 
    type: Schema.Types.ObjectId, 
    ref: 'MemoryBook',
    required: true,
    index: true
  },
  photoId: { type: String, required: true },
  url: { type: String, required: true },
  note: { type: String, default: '' },
  prompt: { type: String, default: '' },
  contributedAt: { type: Date, default: Date.now }
});

export const Contribution = mongoose.model<IContribution>('Contribution', ContributionSchema);
