import { addItem,getCart, incrementCartItemQuantity, decrementCartItemQuantity, removeItem } from "../service/cart.api";
import { useDispatch } from "react-redux";
import { addItem as addItemToCart, setItems } from "../state/cart.slice";

export const useCart = () =>{
    const dispatch = useDispatch();

    async function handleAddToCart(productId, variantId) {
        try {
            const cartItem = await addItem(productId, variantId);
            dispatch(addItemToCart(cartItem));
        } catch (error) {
            console.error("Error adding item to cart:", error);
        }
    }





    async function handleGetCart(){
        const data = await getCart();
        dispatch(setItems(data.cart.items));
    }

    async function handleIncrementCartItemQuantity(productId, variantId){
        try {
            const data = await incrementCartItemQuantity(productId, variantId);
            console.log("Quantity incremented:", data);
        } catch (error) {
            console.error("Error incrementing cart item quantity:", error);
        }
    }

    async function handleDecrementCartItemQuantity(productId, variantId){
        try {
            const data = await decrementCartItemQuantity(productId, variantId);
            dispatch(setItems(data.cart.items));
            return data;
        } catch (error) {
            console.error("Error decrementing cart item quantity:", error);
        }
    }

    async function handleRemoveCartItem(productId, variantId) {
        try {
            const data = await removeItem(productId, variantId);
            dispatch(setItems(data.cart.items));
            return data;
        } catch (error) {
            console.error("Error removing cart item:", error);
        }
    }

    return { handleAddToCart, handleGetCart, handleIncrementCartItemQuantity, handleDecrementCartItemQuantity, handleRemoveCartItem };
}
