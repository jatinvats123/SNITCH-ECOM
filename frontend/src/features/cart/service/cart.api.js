import axios from "axios";

const cartApiInstance = axios.create({
    baseURL: "/api/cart",
    withCredentials: true,
});
export const addItem = async (productId, variantId) => {
    const response = await cartApiInstance.post(`/add/${productId}`, {variantId, quantity: 1});

    return response.data;
}

export const getCart = async () => {
    const response = await cartApiInstance.get("/");
    return response.data;
}

export const incrementCartItemQuantity = async (productId, variantId) => {
    const response = await cartApiInstance.patch(`/quantity/increament/${productId}/${variantId}`);
    return response.data;
}

export const removeItem = async (productId, variantId) => {
    const path = variantId ? `/remove/${productId}/${variantId}` : `/remove/${productId}`;
    const response = await cartApiInstance.delete(path);
    return response.data;
}