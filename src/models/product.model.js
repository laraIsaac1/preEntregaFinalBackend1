import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0 },
    status: { type: Boolean, default: true }, // disponible o no
    code: { type: String, required: true, unique: true },
    thumbnails: { type: [String], default: [] }
  },
  { timestamps: true }
);

export const ProductModel = mongoose.model('Product', productSchema);
