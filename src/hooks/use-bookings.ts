import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";

export interface Booking {
  id: string;
  client_id: string;
  session_type: string;
  category: string | null;
  start_time: string;
  end_time: string;
  created_at: string;
  // Related data from joins
  client?: {
    name: string;
    email: string;
  };
}

export function useBookings() {
  const [data, setData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mock data for testing when Supabase is unavailable
  const mockBookings: Booking[] = [
    {
      id: "1",
      client_id: "client-1",
      session_type: "Portrait Session",
      category: "Photography",
      start_time: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
      end_time: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
      created_at: new Date().toISOString(),
      client: {
        name: "Jane Smith",
        email: "jane@example.com",
      },
    },
    {
      id: "2",
      client_id: "client-2",
      session_type: "Consultation",
      category: "Planning",
      start_time: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
      end_time: new Date(new Date().setHours(14, 30, 0, 0)).toISOString(),
      created_at: new Date().toISOString(),
      client: {
        name: "John Doe",
        email: "john@example.com",
      },
    },
    {
      id: "3",
      client_id: "client-3",
      session_type: "Wedding",
      category: "Event",
      start_time: new Date(
        new Date().setDate(new Date().getDate() + 1)
      ).toISOString(),
      end_time: new Date(
        new Date().setDate(new Date().getDate() + 1)
      ).toISOString(),
      created_at: new Date().toISOString(),
      client: {
        name: "Alice & Bob",
        email: "wedding@example.com",
      },
    },
  ];

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);

      // Temporarily using mock data only
      setData(mockBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch bookings");
      // Fall back to mock data on errors
      console.log("Using mock data due to error");
      setData(mockBookings);
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
  }) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .insert([bookingData])
        .select()
        .single();

      if (error) throw error;

      await fetchBookings(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error("Error creating booking:", err);
      return { data: null, error: err instanceof Error ? err.message : "Failed to create booking" };
    }
  };

  const updateBooking = async (id: string, updates: Partial<{
    client_id: string;
    session_type: string;
    category: string;
    start_time: string;
    end_time: string;
  }>) => {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      await fetchBookings(); // Refresh the list
      return { data, error: null };
    } catch (err) {
      console.error("Error updating booking:", err);
      return { data: null, error: err instanceof Error ? err.message : "Failed to update booking" };
    }
  };

  const deleteBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("id", id);

      if (error) throw error;

      await fetchBookings(); // Refresh the list
      return { error: null };
    } catch (err) {
      console.error("Error deleting booking:", err);
      return { error: err instanceof Error ? err.message : "Failed to delete booking" };
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
