import mongoose, { Schema, Document } from 'mongoose';

export interface IPhoto {
  id: string;
  url: string; // URL để load ảnh: /api/images/:filename
  note: string;
  prompt: string;
}

export type PhotoLayout = 
  | 'single'
  | 'two-horizontal'
  | 'two-vertical'
  | 'three-left'
  | 'three-right'
  | 'three-top'
  | 'three-bottom'
  | 'four-grid';

export interface IPhotoPage {
  id: string;
  photos: IPhoto[];
  layout: PhotoLayout;
  note: string;
}

export type MemoryBookType = 'Lớp học' | 'Phòng ban' | 'Nhóm';

export interface IMemoryBook extends Document {
  name: string;
  type: MemoryBookType;
  pages: IPhotoPage[];
  shareId: string; // Unique public ID for sharing
  contributeId: string; // Unique public ID for contributing
  createdAt: Date;
  updatedAt: Date;
}

const PhotoSchema = new Schema<IPhoto>({
  id: { type: String, required: true },
  url: { type: String, required: true },
  note: { type: String, default: '' },
  prompt: { type: String, default: '' }
}, { _id: false });

const PhotoPageSchema = new Schema<IPhotoPage>({
  id: { type: String, required: true },
  photos: [PhotoSchema],
  layout: { 
    type: String, 
    enum: ['single', 'two-horizontal', 'two-vertical', 'three-left', 'three-right', 'three-top', 'three-bottom', 'four-grid'],
    required: true 
  },
  note: { type: String, default: '' }
}, { _id: false });

const MemoryBookSchema = new Schema<IMemoryBook>({
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Lớp học', 'Phòng ban', 'Nhóm'],
    required: true 
  },
  pages: [PhotoPageSchema],
  shareId: { type: String, required: true, unique: true, index: true },
  contributeId: { type: String, required: true, unique: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update updatedAt before saving
MemoryBookSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const MemoryBook = mongoose.model<IMemoryBook>('MemoryBook', MemoryBookSchema);
