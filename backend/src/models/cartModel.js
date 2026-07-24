import mongoose from "mongoose";
import priceSchema from "./price.schema.js";
const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
      quantity: { type: Number, required: true, default: 1 },
      price: { type: priceSchema, required: true },
      variant: { type: mongoose.Schema.Types.ObjectId, ref: "product" },
      variantKey: { type: mongoose.Schema.Types.ObjectId },
      variantSnapshot: {
        label: { type: String },
        images: [
          {
            url: { type: String },
          },
        ],
        attributes: {
          type: Map,
          of: String,
        },
        price: { type: priceSchema },
      },
    },
  ],
});

const cartModel = mongoose.model("cart", cartSchema);

export default cartModel;
