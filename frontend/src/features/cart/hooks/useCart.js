import {
  addItem,
  getCart,
  incrementCartItemQuantity,
  decrementCartItemQuantity,
  removeItem,
} from "../service/cart.api";
import { useDispatch } from "react-redux";
import { setItems } from "../state/cart.slice";

export const useCart = () => {
  const dispatch = useDispatch();

  async function handleAddToCart(productId, variantId) {
    try {
      const data = await addItem(productId, variantId);
      if (data?.cart?.items) dispatch(setItems(data.cart.items));
      return data;
    } catch (error) {
      console.error("Error adding item to cart:", error);
    }
  }

  async function handleGetCart() {
    try {
      const data = await getCart();
      if (data?.cart?.items) dispatch(setItems(data.cart.items));
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  }

  async function handleIncrementCartItemQuantity(productId, variantId) {
    try {
      await incrementCartItemQuantity(productId, variantId);
    } catch (error) {
      console.error("Error incrementing cart item quantity:", error);
    }
  }

  async function handleDecrementCartItemQuantity(productId, variantId) {
    try {
      const data = await decrementCartItemQuantity(productId, variantId);
      if (data?.cart?.items) dispatch(setItems(data.cart.items));
      return data;
    } catch (error) {
      console.error("Error decrementing cart item quantity:", error);
    }
  }

  async function handleRemoveCartItem(productId, variantId) {
    try {
      const data = await removeItem(productId, variantId);
      if (data?.cart?.items) dispatch(setItems(data.cart.items));
      return data;
    } catch (error) {
      console.error("Error removing cart item:", error);
    }
  }

  return {
    handleAddToCart,
    handleGetCart,
    handleIncrementCartItemQuantity,
    handleDecrementCartItemQuantity,
    handleRemoveCartItem,
  };
};
