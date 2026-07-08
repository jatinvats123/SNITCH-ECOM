import {createProduct,getSellerProducts,getAllProducts,getProductDetail,createVariant,updateVariantStock,deleteVariant,deleteProduct} from "../services/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts, setProducts } from "../state/product.slice";

export const useProduct=()=>{
    const dispatch = useDispatch();
    const handleCreateProduct = async (formData)=>{
        const data = await createProduct(formData);

        return data;
    }
    const handleGetProducts = async ()=>{
        const data = await getSellerProducts();
        dispatch(setSellerProducts(data.products));
        return data.products;
    }
    const handleGetAllProducts = async ()=>{
        const data = await getAllProducts();
        dispatch(setProducts(data.products));
        return data.products;
    }
    const handleGetProductById = async (productId)=>{
        const data = await getProductDetail(productId);
        return data.product;
    }
    const handleCreateVariant = async (productId, variantData)=>{
        const data = await createVariant(productId, variantData);
        return data;
    }
    const handleUpdateVariantStock = async (productId, variantId, stock)=>{
        const data = await updateVariantStock(productId, variantId, stock);
        return data;
    }
    const handleDeleteVariant = async (productId, variantId)=>{
        const data = await deleteVariant(productId, variantId);
        return data;
    }
    const handleDeleteProduct = async (productId)=>{
        const data = await deleteProduct(productId);
        return data;
    }
    return {
        handleCreateProduct,
        handleGetProducts,
        handleGetAllProducts,
        handleGetProductById,
        handleCreateVariant,
        handleUpdateVariantStock,
        handleDeleteVariant,
        handleDeleteProduct
    }
}
