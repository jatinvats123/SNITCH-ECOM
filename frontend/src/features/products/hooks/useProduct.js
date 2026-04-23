import {createProduct,getSellerProducts} from "../services/product.api";
import { useDispatch } from "react-redux";
import { setSellerProducts } from "../state/product.slice";

export const useProduct=()=>{
    const dispatch = useDispatch();
    const handleCreateProduct = async (formData)=>{
        const data = await createProduct(formData);

        return data.products;
    }
    const handleGetProducts = async ()=>{
        const data = await getSellerProducts();
        dispatch(setSellerProducts(data.products));
        return data.products;
    }
    return {
        handleCreateProduct,
        handleGetProducts,
    }
}
