import cartModel from "../models/cartModel.js";
import productModel from "../models/productModel.js";
export async function addToCart(req,res){
    const {productId,variantId}=req.params;
    const product = await productModel.findOne({
        _id:productId,
        "variants._id":variantId
    });
    if(!product){
        return res.status(404).json({
            message:"Product or variant not found",
            success:false
        })
    })
    const cart= await cartModel.findOne({user:req.user._id})||(await cartModel.create({user:req.user._id,}))

    const isProductAlreadyInCart = cart.items.some(item=>item.product.toString()===productId && item.variant.toString()===variantId);

}