import {createSlice} from "@reduxjs/toolkit";


const productSlice = createSlice({
    name:"product",
    initialState:{
        products:[],
    },
    reducers:{
        setSellerProducts:(state,action)=>{
            state.products = action.payload;
        }
    }
})
export const {setSellerProducts} = productSlice.actions;
export default productSlice.reducer;