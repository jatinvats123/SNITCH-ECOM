import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useCart } from '../hooks/useCart';

const cart = () => {
    const cartItems = useSelector((state) => state.cart.items);
    const { handleGetCart } = useCart();
     

    console.log(cartItems);
    useEffect(() => {
        handleGetCart();
    }, []);
  return (
    <div>
      cart
    </div>
  )
}

export default cart
