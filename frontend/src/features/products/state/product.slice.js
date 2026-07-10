import {createSlice} from "@reduxjs/toolkit";


const productSlice = createSlice({
    name:"product",
    initialState:{
        sellerProducts:[],
        products:[],
    },
    reducers:{
        setSellerProducts:(state,action)=>{
             state.sellerProducts = action.payload; 
        },
        setProducts:(state,action)=>{
            state.products = action.payload;
        },
        appendProducts:(state,action)=>{
            state.products = state.products.concat(action.payload);
        }
    }
})
export const {setSellerProducts,setProducts,appendProducts} = productSlice.actions;
export default productSlice.reducer;