import {createProduct,getSellerProducts,getAllProducts,getProductDetail} from "../services/product.api";
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
    return {
        handleCreateProduct,
        handleGetProducts,
        handleGetAllProducts,
        handleGetProductById
    }
}
