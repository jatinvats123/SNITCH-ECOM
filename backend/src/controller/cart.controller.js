import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";
import { stockOfVariant } from "../dao/product.dao.js";
import { getCartWithTotals } from "../dao/cart.dao.js";
import { AppError } from "../utils/AppError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";

const buildVariantSnapshot = (product, variant) => {
  const attributes =
    variant.attributes instanceof Map
      ? Object.fromEntries(variant.attributes.entries())
      : variant.attributes || {};
  const label = Object.entries(attributes)
    .map(([key, value]) => `${key}: ${value}`)
    .join(" / ");

  return {
    label: label || product.title,
    images: variant.images || [],
    attributes,
    price: variant.price,
  };
};

const getVariantMatchValue = (variant) =>
  variant?.variantId?.toString() || variant?._id?.toString() || null;
const getItemVariantMatchValue = (item) =>
  item?.variantKey?.toString() || item?.variant?.toString() || null;

export const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { variantId, quantity = 1 } = req.body;

  const product = await productModel.findById(productId);
  if (!product) {
    throw AppError.notFound("Product not found", "PRODUCT_NOT_FOUND");
  }

  // If variantId is provided, check the variant exists.
  let price = product.price;
  let variant = null;
  if (variantId) {
    variant = product.variants.find(
      (v) => v._id.toString() === variantId || v.variantId?.toString() === variantId,
    );
    if (!variant) {
      throw AppError.notFound("Variant not found", "VARIANT_NOT_FOUND");
    }
    price = variant.price;
  }

  const cart =
    (await cartModel.findOne({ user: req.user._id })) ||
    (await cartModel.create({ user: req.user._id }));

  const requestedVariantId = variantId || null;
  const existingItem = cart.items.find(
    (item) =>
      item.product.toString() === productId &&
      getItemVariantMatchValue(item) === requestedVariantId,
  );
  const quantityInCart = existingItem?.quantity || 0;

  if (variant) {
    const stock = await stockOfVariant(productId, variant._id.toString());
    if (quantityInCart + quantity > stock) {
      throw AppError.badRequest("Requested quantity exceeds available stock", "INSUFFICIENT_STOCK");
    }
  }

  if (existingItem) {
    await cartModel.findOneAndUpdate(
      { user: req.user._id, "items.product": productId, "items.variantKey": requestedVariantId },
      { $inc: { "items.$.quantity": quantity } },
    );
  } else {
    const variantKey = variant ? getVariantMatchValue(variant) : null;

    cart.items.push({
      product: productId,
      variant: variant?._id || variantId,
      variantKey,
      quantity,
      price,
      ...(variant ? { variantSnapshot: buildVariantSnapshot(product, variant) } : {}),
    });
    await cart.save();
  }

  const updatedCart = await getCartWithTotals(req.user._id);
  return sendSuccess(res, 200, "Product added to cart successfully", { cart: updatedCart });
});

export const getCart = asyncHandler(async (req, res) => {
  const cart = await getCartWithTotals(req.user._id);
  if (!cart) {
    return sendSuccess(res, 200, "Cart fetched successfully", {
      cart: { items: [], totalPrice: 0, currency: "INR" },
    });
  }
  return sendSuccess(res, 200, "Cart fetched successfully", { cart });
});

export const incrementCartItemQuantity = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    throw AppError.notFound("Cart not found", "CART_NOT_FOUND");
  }

  const item = cart.items.find(
    (i) => i.product.toString() === productId && getItemVariantMatchValue(i) === variantId,
  );
  if (!item) {
    throw AppError.notFound("Item not found in cart", "CART_ITEM_NOT_FOUND");
  }

  item.quantity += 1;
  await cart.save();

  const updatedCart = await getCartWithTotals(req.user._id);
  return sendSuccess(res, 200, "Item quantity incremented successfully", { cart: updatedCart });
});

export const decrementCartItemQuantity = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    throw AppError.notFound("Cart not found", "CART_NOT_FOUND");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId && getItemVariantMatchValue(item) === variantId,
  );
  if (itemIndex === -1) {
    throw AppError.notFound("Item not found in cart", "CART_ITEM_NOT_FOUND");
  }

  if (cart.items[itemIndex].quantity <= 1) {
    cart.items.splice(itemIndex, 1);
  } else {
    cart.items[itemIndex].quantity -= 1;
  }

  await cart.save();

  const updatedCart = await getCartWithTotals(req.user._id);
  return sendSuccess(res, 200, "Item quantity decremented successfully", { cart: updatedCart });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const { productId, variantId } = req.params;
  const cart = await cartModel.findOne({ user: req.user._id });
  if (!cart) {
    throw AppError.notFound("Cart not found", "CART_NOT_FOUND");
  }

  const pullCriteria = variantId
    ? { product: productId, variantKey: variantId }
    : { product: productId, $or: [{ variant: { $exists: false } }, { variant: null }] };

  await cartModel.findByIdAndUpdate(cart._id, { $pull: { items: pullCriteria } }, { new: true });
  const updatedCart = await getCartWithTotals(req.user._id);

  return sendSuccess(res, 200, "Item removed from cart successfully", { cart: updatedCart });
});
