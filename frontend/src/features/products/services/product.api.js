import axios from "axios";

const productApiInstance = axios.create({
    baseURL:"/api/products",
    withCredentials:true
})

export async function getAllProducts(){
    const response = await productApiInstance.get('/all')
    return response.data;
}

export async function getProductById(formData){
    const response = await productApiInstance.get("/create")
    return response.data;
}