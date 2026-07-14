import mongoose from "mongoose";
import priceSchema from "./price.schema.js";

// Snapshot of a single line item at the moment the order was placed.
// Stored on the order (not referenced live) so order history stays accurate
// even if the product/variant is later edited or deleted.
const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "product", required: true },
    variant: { type: mongoose.Schema.Types.ObjectId }, // matches cart item's variantKey
    title: { type: String, required: true },
    label: { type: String, default: "" }, // human-readable variant label e.g. "Size: M / Color: Black"
    image: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: priceSchema, required: true }, // unit price snapshot (catalog units, e.g. rupees)
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true, index: true },
    items: { type: [orderItemSchema], required: true },

    // Monetary totals are stored in the smallest currency unit (paise for INR),
    // the same unit Razorpay uses. Keeping integers here avoids floating-point drift.
    subtotal: { type: Number, required: true },
    tax: { type: Number, required: true },
    amount: { type: Number, required: true }, // total actually charged = subtotal + tax
    currency: { type: String, default: "INR" },

    status: {
        type: String,
        enum: ["created", "paid", "failed"],
        default: "created",
        index: true,
    },

    // Razorpay references
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },

    paidAt: { type: Date },
    failureReason: { type: String },
}, { timestamps: true });

const orderModel = mongoose.model("order", orderSchema);

export default orderModel;
