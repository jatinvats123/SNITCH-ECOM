import React from 'react'
import {useState} from "react";
import { useEffect } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useParams } from 'react-router';

const SellerProductDetails = () => {
  const [product, setProduct] = useState(null);
  const { productId } = useParams();
  const { handleGetProductById } = useProduct();
  
  async function fetchProductDetail() {
    try {
      const data = await handleGetProductById(productId);
      setProduct(data?.product || data);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  }
  
  useEffect(() => {
    fetchProductDetail();
  }, [productId]);
 console.log(product)
      
  return (
    
    <div>
      <h1>SellerProductDetails</h1>
    </div>
  )
}

export default SellerProductDetails
