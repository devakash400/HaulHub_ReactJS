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
