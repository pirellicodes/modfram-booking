import { useEffect,useState } from "react";
// Define local type instead of importing from deleted location
interface BookingWithClient {
  id: string;
  client_id: string;
  session_type: string;
  category: string;
  start_time: string;
  end_time: string;
  created_at: string;
  status?: string;
  notes?: string;
  user_id: string;
  client?: {
    id: string;
    name: string;
    email: string;
  };
}

export function useBookings() {
  const [data, setData] = useState<BookingWithClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBookings();
     
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/bookings");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const bookings = await response.json();
      setData((bookings as BookingWithClient[]) || []);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
      setData([]); // Set empty array instead of mock data
    } finally {
      setLoading(false);
    }
  };

  const refetch = async () => {
    await fetchBookings();
  };

  const createBooking = async (bookingData: {
    client_id: string;
    session_type: string;
    category?: string;
    start_time: string;
    end_time: string;
    status?: string;
    notes?: string;
  }) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      await fetchBookings(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error("Error creating booking:", err);
      return {
        data: null,
        error: err instanceof Error ? err.message : "Failed to create booking",
      };
    }
  };

  const updateBooking = async (
    id: string,
    updates: Partial<{
      client_id: string;
      session_type: string;
      category: string;
      start_time: string;
      end_time: string;
      status: string;
      notes: string;
    }>
  ) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, ...updates }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      await fetchBookings(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error("Error updating booking:", err);
      return {
        data: null,
        error: err instanceof Error ? err.message : "Failed to update booking",
      };
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const response = await fetch(`/api/bookings?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      await fetchBookings(); // Refresh the list
      return { error: null };
    } catch (err) {
      console.error("Error deleting booking:", err);
      return {
        error: err instanceof Error ? err.message : "Failed to delete booking",
      };
    }
  };

  return {
    data,
    loading,
    error,
    refetch,
    createBooking,
    updateBooking,
    deleteBooking,
  };
}
