import axios from "axios";

const productApiInstance = axios.create({
    baseURL:"/api/products",
    withCredentials:true
})
// FUNCTION FOR CREATING PRODUCT
export async function createProduct(formData){
    const response = await productApiInstance.post("", formData)
    return response.data;
}


export async function getSellerProducts()
{
    const response = await productApiInstance.get("/seller")
    return response.data;
}

export async function getAllProducts(filters = {})
{
    const response = await productApiInstance.get("", { params: filters })
    return response.data;
}

export async function getProductDetail(productId)
{
    const response = await productApiInstance.get(`/detail/${productId}`)
    return response.data;
}

export async function createVariant(productId, variantData)
{
    const response = await productApiInstance.post(`/${productId}/variants`, variantData)
    return response.data;
}

export async function updateVariantStock(productId, variantId, stock)
{
    const response = await productApiInstance.patch(`/${productId}/variants/${variantId}/stock`, { stock })
    return response.data;
}

export async function deleteVariant(productId, variantId)
{
    const response = await productApiInstance.delete(`/${productId}/variants/${variantId}`)
    return response.data;
}

export async function deleteProduct(productId)
{
    const response = await productApiInstance.delete(`/${productId}`)
    return response.data;
}