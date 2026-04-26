import React from 'react'
import {useState} from "react";
import { useEffect } from 'react';
import { useProduct } from '../hooks/useProduct';
import { useParams } from 'react-router';

const SellerProductDetails = () => {
    const { productId } = useParams();
    const { handleGetProductById } = useProduct();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(false);
      
          useEffect(() => {
              async function fetchProductDetail() {
                  setLoading(true);
                  const data = await handleGetProductById(productId);
                  setProduct(data);
                  setLoading(false);
              }
              fetchProductDetail();
          }, [productId]);
          console.log(product);
      
  return (
    
    <div>
      <h1>SellerProductDetails</h1>
    </div>
  )
}

export default SellerProductDetails
