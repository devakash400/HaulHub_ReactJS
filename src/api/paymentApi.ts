import api from "./api.ts";

export const createPaymentIntent = async (bookingId: string) => {
  try {
    const response = await api.post(`/api/payment/booking/${bookingId}/create-intent`);
    return response.data;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

export const confirmPaymentIntent = async (payload: {
  paymentIntentId: string;
  cardNumber: string;
  expMonth: number;
  expYear: number;
  cvc: string;
}) => {
  try {
    const response = await api.post(`/api/payment/confirm-intent`, payload);
    return response.data;
  } catch (error) {
    console.error("Error confirming payment intent:", error);
    throw error;
  }
};
