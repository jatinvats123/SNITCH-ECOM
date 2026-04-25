import React from 'react'
import { useSelector } from 'react-redux'
import { useProduct } from '../hooks/useProduct'
import { useEffect } from 'react'
const Home = () => {
    const products = useSelector(state =>state.product.products);
    const{handleGetAllProducts} = useProduct();
    console.log(products);
    useEffect(()=>{
        handleGetAllProducts();
    },[])
    return (
        <div>
            home
        </div>
    )
}

export default Home
