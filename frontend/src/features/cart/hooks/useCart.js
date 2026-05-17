import { addItem,getCart} from "../service/cart.api";
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
    return { handleAddToCart,handleGetCart};
}