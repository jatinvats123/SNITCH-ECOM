import { createSlice } from "@reduxjs/toolkit";

const productSlice = createSlice({
  name: "product",
  initialState: {
    sellerProducts: [],
    products: [],
  },
  reducers: {
    setSellerProducts: (state, action) => {
      state.sellerProducts = action.payload;
    },
    setProducts: (state, action) => {
      // Coerce to an array so a failed/unexpected API response can never make
      // `products` undefined (which would crash components that read .length/.map).
      state.products = Array.isArray(action.payload) ? action.payload : [];
    },
    appendProducts: (state, action) => {
      const incoming = Array.isArray(action.payload) ? action.payload : [];
      state.products = (state.products || []).concat(incoming);
    },
  },
});
export const { setSellerProducts, setProducts, appendProducts } = productSlice.actions;
export default productSlice.reducer;
