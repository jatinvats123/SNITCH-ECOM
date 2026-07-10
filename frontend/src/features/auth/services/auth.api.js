import axios from "axios";
const authApiInstance = axios.create({
    baseURL:"/api/auth",
    withCredentials:true
})

export async function register({email,contact,password,fullname,isSeller}){
    const response = await authApiInstance.post("/register",{
        email,
        contact,
        password,
        fullname,
        isSeller
    })
    return response.data;
}




export async function login({email,password}){
    const response = await authApiInstance.post("/login",{
        email,
        password
    })
    return response.data;
}
export async function getMe(){
    const response = await authApiInstance.get("/me");
    return response.data;
}

export async function logout(){
    const response = await authApiInstance.post("/logout");
    return response.data;
}

export async function forgotPassword(email){
    const response = await authApiInstance.post("/forgot-password",{email});
    return response.data;
}

export async function resetPassword(token, password){
    const response = await authApiInstance.post(`/reset-password/${token}`,{password});
    return response.data;
}

export async function getProductById(productId){
    const response = await authApiInstance.get(`/product/${productId}`);
    return response.data;
}