import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";
import { stockOfVariant } from "../dao/product.dao.js";

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
        if(variantId) {
            const variant = product.variants.find(v => v._id.toString() === variantId);
            if(!variant) {
                return res.status(404).json({
                    message:"Variant not found",
                    success:false
                })
            }
            price = variant.price;
        }

        const cart= await cartModel.findOne({user:req.user._id})||(await cartModel.create({user:req.user._id,}))

        const isProductAlreadyInCart = cart.items.some(item=>item.product.toString()===productId && item.variant?.toString()===variantId);
        if(isProductAlreadyInCart){
            const quantityInCart = cart.items.find(item=>item.product.toString()===productId && item.variant?.toString()===variantId).quantity;
            
            await cartModel.findOneAndUpdate(
                {user: req.user._id,"items.product": productId, "items.variant": variantId},
                { $inc: { "items.$.quantity": quantity } }
            )
        } else {
            cart.items.push({product: productId, variant: variantId, quantity, price})
            await cart.save()
        }
        
        return res.status(200).json({
            message:"Product added to cart successfully",
            success:true
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
        const cart = await cartModel.findOne({user:user._id}).populate("items.product").populate("items.variant");
        if(!cart){
            return res.status(404).json({
                message:"Cart not found",
                success:false
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