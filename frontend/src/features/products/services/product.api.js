import axios from "axios";

const productApiInstance = axios.create({
    baseURL:"/api/products",
    withCredentials:true
})
// FUNCTION FOR CREATING PRODUCT
export async function createProduct(formData){
    const response = await productApiInstance.post("/", formData)
    return response.data;
}


export async function getSellerProducts()
{
    const response = await productApiInstance.get("/seller")
    return response.data;
}