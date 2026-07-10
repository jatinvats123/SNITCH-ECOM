import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";
import { stockOfVariant } from "../dao/product.dao.js";
import { getCartWithTotals } from "../dao/cart.dao.js";

const buildVariantSnapshot = (product, variant) => {
    const attributes = variant.attributes instanceof Map
        ? Object.fromEntries(variant.attributes.entries())
        : (variant.attributes || {});
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

const getVariantMatchValue = (variant) => variant?.variantId?.toString() || variant?._id?.toString() || null;
const getItemVariantMatchValue = (item) => item?.variantKey?.toString() || item?.variant?.toString() || null;

export async function addToCart(req,res){
    try {
        const {productId}=req.params;
        const {variantId, quantity=1}=req.body;
        
        const product = await productModel.findById(productId);
        if(!product){
            return res.status(404).json({
                message:"Product not found",
                success:false
            })
        }
        
        // If variantId is provided, check if variant exists
        let price = product.price;
        let variant = null;
        if(variantId) {
            variant = product.variants.find(v => v._id.toString() === variantId || v.variantId?.toString() === variantId);
            if(!variant) {
                return res.status(404).json({
                    message:"Variant not found",
                    success:false
                })
            }
            price = variant.price;
        }

        const cart= await cartModel.findOne({user:req.user._id})||(await cartModel.create({user:req.user._id,}))

        const requestedVariantId = variantId || null;
        const existingItem = cart.items.find(item => {
            return item.product.toString() === productId && getItemVariantMatchValue(item) === requestedVariantId;
        });
        const quantityInCart = existingItem?.quantity || 0;

        if(variant) {
            const stock = await stockOfVariant(productId, variant._id.toString());
            if(quantityInCart + quantity > stock) {
                return res.status(400).json({
                    message:"Requested quantity exceeds available stock",
                    success:false
                })
            }
        }

        if(existingItem){
            await cartModel.findOneAndUpdate(
                {user: req.user._id,"items.product": productId, "items.variantKey": requestedVariantId},
                { $inc: { "items.$.quantity": quantity } }
            )
        } else {
            const variantKey = variant ? getVariantMatchValue(variant) : null;

            cart.items.push({
                product: productId,
                variant: variant?._id || variantId,
                variantKey,
                quantity,
                price,
                ...(variant ? { variantSnapshot: buildVariantSnapshot(product, variant) } : {})
            })
            await cart.save()
        }

        const updatedCart = await getCartWithTotals(req.user._id);

        return res.status(200).json({
            message:"Product added to cart successfully",
            success:true,
            cart: updatedCart
        })
    } catch (error) {
        console.error("Error adding to cart:", error);
        return res.status(400).json({
            message: error.message || "Error adding product to cart",
            success: false
        })
    }
};


export const getCart = async (req,res) => {
    try {
        const user = req.user
        const cart = await getCartWithTotals(user._id);
        if(!cart){
            return res.status(200).json({
                message:"Cart fetched successfully",
                success:true,
                cart: { items: [], totalPrice: 0, currency: "INR" }
            })
        }
        return res.status(200).json({
            message:"Cart fetched successfully",
            success:true,
            cart
        })
    } catch (error) {
        console.error("Error fetching cart:", error);
        return res.status(500).json({
            message: error.message || "Error fetching cart",
            success: false
        })
    }
}

export async function incrementCartItemQuantity(req,res){
    try {
        const {productId, variantId}=req.params;
        const user = req.user;    
        const cart = await cartModel.findOne({user:user._id});
        if(!cart){
            return res.status(404).json({
                message:"Cart not found",
                success:false
            })
        }
        const item = cart.items.find(i=>i.product.toString()===productId && getItemVariantMatchValue(i)===variantId);
        if(!item){
            return res.status(404).json({
                message:"Item not found in cart",
                success:false
            })
        }
        item.quantity+=1;
        await cart.save();

        const updatedCart = await getCartWithTotals(user._id);

        return res.status(200).json({
            message:"Item quantity incremented successfully",
            success:true,
            cart: updatedCart
        })
    } catch (error) {
        console.error("Error incrementing cart item quantity:", error);
        return res.status(500).json({
            message: error.message || "Error incrementing cart item quantity",
            success: false
        })  
    }
}

export async function decrementCartItemQuantity(req, res) {
    try {
        const { productId, variantId } = req.params;
        const user = req.user;
        const cart = await cartModel.findOne({ user: user._id });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false,
            });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId && getItemVariantMatchValue(item) === variantId
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                message: "Item not found in cart",
                success: false,
            });
        }

        if (cart.items[itemIndex].quantity <= 1) {
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity -= 1;
        }

        await cart.save();

        const updatedCart = await getCartWithTotals(user._id);

        return res.status(200).json({
            message: "Item quantity decremented successfully",
            success: true,
            cart: updatedCart,
        });
    } catch (error) {
        console.error("Error decrementing cart item quantity:", error);
        return res.status(500).json({
            message: error.message || "Error decrementing cart item quantity",
            success: false,
        });
    }
}

export async function removeCartItem(req, res) {
    try {
        const { productId, variantId } = req.params;
        const user = req.user;
        const cart = await cartModel.findOne({ user: user._id });

        if (!cart) {
            return res.status(404).json({
                message: "Cart not found",
                success: false,
            });
        }

        const pullCriteria = variantId
            ? { product: productId, variantKey: variantId }
            : { product: productId, $or: [{ variant: { $exists: false } }, { variant: null }] };

        await cartModel.findByIdAndUpdate(
            cart._id,
            { $pull: { items: pullCriteria } },
            { new: true }
        );
        const updatedCart = await getCartWithTotals(user._id);

        return res.status(200).json({
            message: "Item removed from cart successfully",
            success: true,
            cart: updatedCart,
        });
    } catch (error) {
        console.error("Error removing cart item:", error);
        return res.status(500).json({
            message: error.message || "Error removing item from cart",
            success: false,
        });
    }
}