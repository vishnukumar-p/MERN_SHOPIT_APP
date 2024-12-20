import {createSlice} from '@reduxjs/toolkit';

const initialState = {
    cartItems: localStorage.getItem("cartItems") ? JSON.parse((localStorage.getItem("cartItems"))):[],
    shippingInfo:localStorage.getItem("shippingInfo") ? JSON.parse((localStorage.getItem("shippingInfo"))):{},
}

export const cartSlice =  createSlice({
    initialState,
    name:"userSlice",
    reducers: {
        setCartItem: (state,action) => {

            const item = action.payload;

            const isItemExist = state.cartItems.find((i) => i.product === item.product);

            if(isItemExist){
                state.cartItems = state.cartItems.map((e) => e.product === isItemExist.product ? item:e)
            }else{
                state.cartItems = [...state.cartItems, item];
            }

            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },
        removeCartItem: (state,action) => {
            state.cartItems = state.cartItems.filter((e) => e.product !== action.payload);
            localStorage.setItem("cartItems", JSON.stringify(state.cartItems));
        },
        clearCart: (state,action) => {
            localStorage.removeItem("cartItems");
            state.cartItems = [];
        },
        saveShippingInfo: (state,action) => {
            state.shippingInfo = action.payload;
            localStorage.setItem("shippingInfo", JSON.stringify(state.shippingInfo));
        }
    }
}
)

export const {setCartItem,removeCartItem,saveShippingInfo,clearCart} = cartSlice.actions

export default cartSlice.reducer;