
export type Booking = {
  id: string;
  client_id: string;
  session_type: string;
  category: string;
  start_time: string;
  end_time: string;
  created_at: string;
  clients: {
    name: string;
    email: string;
  }
};

export type Payment = {
  id: string;
  booking_id: string;
  amount_cents: number;
  currency: string;
  provider: string;
  status: "pending" | "succeeded" | "failed";
  created_at: string;
  bookings: Booking;
};
