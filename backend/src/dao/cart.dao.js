import mongoose from "mongoose";
import cartModel from "../models/cartModel.js";

export const getCartWithTotals = async (userId) => {
  const [cart] = await cartModel.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "items.product",
      },
    },
    { $unwind: { path: "$items.product", preserveNullAndEmptyArrays: true } },
    {
      // items.variant / items.variantKey point at a variant *subdocument* inside
      // product.variants, not a top-level product doc — resolve the matching one here.
      $addFields: {
        "items.product.variants": {
          $first: {
            $filter: {
              input: { $ifNull: ["$items.product.variants", []] },
              as: "variant",
              cond: {
                $or: [
                  { $eq: ["$$variant._id", "$items.variant"] },
                  { $eq: ["$$variant.variantId", "$items.variantKey"] },
                ],
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$user" },
        items: { $push: "$items" },
        totalPrice: {
          $sum: { $multiply: ["$items.price.amount", "$items.quantity"] },
        },
        currency: { $first: { $ifNull: ["$items.price.currency", "INR"] } },
      },
    },
  ]);

  return cart || null;
};
