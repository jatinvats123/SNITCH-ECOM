import { createSlice } from "@reduxjs/toolkit";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
  },
  reducers: {
    setItems: (state, action) => {
      state.items = action.payload;
    },
    addItem: (state, action) => {
      state.items.push(action.payload);
    },
    incrementItemQuantity: (state, action) => {
      const itemIndex = state.items.findIndex((item) => item.id === action.payload.id);
      if (itemIndex !== -1) {
        state.items[itemIndex].quantity += 1;
      }
    },
  },
});
export const { setItems, addItem, incrementItemQuantity } = cartSlice.actions;
export default cartSlice.reducer;
