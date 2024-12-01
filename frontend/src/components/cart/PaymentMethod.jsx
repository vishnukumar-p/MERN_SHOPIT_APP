import React, { useEffect, useState } from "react";
import MetaData from "../layout/MetaData";
import CheckoutSteps from "./CheckoutSteps";
import { useSelector } from "react-redux";
import { calculateOrderCost } from "../../Helpers/helpers";
import { useCreateNewOrderMutation, useStripeCheckOutSessionMutation } from "../../redux/api/orderApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PaymentMethod = () => {
    const [method, setMethod] = useState("");
    const {shippingInfo, cartItems} = useSelector((state) => state.cart);
    const [createNewOrder, {error,isSuccess}] = useCreateNewOrderMutation();
    const [stripeCheckOutSession, {data:checkoutData,error: checkoutError,isLoading}] = useStripeCheckOutSessionMutation();
    const navigate = useNavigate();

    useEffect(()=>{
        if(checkoutData){
            window.location.href = checkoutData?.url;
        }
        if(checkoutError){
            toast.error(checkoutError?.data?.message)
        }
    },[checkoutData,checkoutError]);

    useEffect(()=>{
        if(error){
            toast.error(error?.data?.message);
            console.log(error?.data);
        }
        if(isSuccess){
            navigate("/me/orders?order_success=true");
        }
    },[error,isSuccess]);

    const submitHandler = (e) => {
        e.preventDefault();

        const {itemsPrice,shippingPrice, taxPrice,totalPrice} = calculateOrderCost(cartItems);

        if(method === "COD"){
            //Create COD order
            const orderData = {
                shippingInfo,
                orderItems: cartItems,
                itemsPrice,
                shippingAmount: shippingPrice,
                taxAmount: taxPrice,
                totalAmount: totalPrice,
                paymentInfo:{
                    status:"Not Paid"
                },
                paymentMethod: "COD"
            }
            createNewOrder(orderData);
        }
        if(method === "Card"){
            const orderData = {
                shippingInfo,
                orderItems: cartItems,
                itemsPrice,
                shippingAmount: shippingPrice,
                taxAmount: taxPrice,
                totalAmount: totalPrice,
            };
            stripeCheckOutSession(orderData);
        }
    }
    return (
        <>
            <MetaData title="Payment Method" />
            <CheckoutSteps shipping confirmOrder payment/>
            <div class="row wrapper">
                <div class="col-10 col-lg-5">
                    <form
                        class="shadow rounded bg-body"
                        onSubmit={submitHandler}
                    >
                        <h2 class="mb-4">Select Payment Method</h2>

                        <div class="form-check">
                            <input
                                class="form-check-input"
                                type="radio"
                                name="payment_mode"
                                id="codradio"
                                value="COD"
                                onChange={(e) => setMethod("COD")}
                            />
                            <label class="form-check-label" for="codradio">
                                Cash on Delivery
                            </label>
                        </div>
                        <div class="form-check">
                            <input
                                class="form-check-input"
                                type="radio"
                                name="payment_mode"
                                id="cardradio"
                                value="Card"
                                onChange={(e) => setMethod("Card")}
                            />
                            <label class="form-check-label" for="cardradio">
                                Card - VISA, MasterCard
                            </label>
                        </div>

                        <button id="shipping_btn" type="submit" class="btn py-2 w-100" disabled={isLoading}>
                            {isLoading?"Setting Payment...":"CONTINUE"}
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

export default PaymentMethod