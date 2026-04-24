import React from 'react'
import {useEffect} from "react";
import {useProduct} from "../hooks/useProduct";
import { useSelector } from "react-redux";
const Dashboard = () => {
   
    const {handleGetProducts} = useProduct();
    const sellerProducts = useSelector((state)=>state.product.sellerProducts);
    useEffect(()=>{
        handleGetProducts();
    },[])
    console.log(sellerProducts);
  return (
    
    <div>
      <h1>Dashboard</h1>
      
    </div>
  )
}

export default Dashboard
