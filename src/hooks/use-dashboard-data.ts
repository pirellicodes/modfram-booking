"use client";

import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  Payment,
  PaymentWithBooking,
  BookingWithClient,
  Availability,
  EventTypeWithParsedFields,
} from "@/lib/types";

// Dashboard stats hook
export function useDashboardStats() {
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalClients: 0,
    upcomingBookings: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const supabase = supabaseBrowser();

        // Fetch total bookings
        const { count: bookingsCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true });

        // Fetch total revenue from successful payments
        const { data: paymentsData } = await supabase
          .from("payments")
          .select("amount_cents")
          .eq("status", "succeeded");

        const totalRevenue =
          paymentsData?.reduce(
            (sum, payment) => sum + payment.amount_cents,
            0
          ) || 0;

        // Fetch total clients
        const { count: clientsCount } = await supabase
          .from("clients")
          .select("*", { count: "exact", head: true });

        // Fetch upcoming bookings (next 30 days)
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

        const { count: upcomingCount } = await supabase
          .from("bookings")
          .select("*", { count: "exact", head: true })
          .gte("start_time", new Date().toISOString())
          .lte("start_time", thirtyDaysFromNow.toISOString());

        setStats({
          totalBookings: bookingsCount || 0,
          totalRevenue: totalRevenue / 100, // Convert cents to dollars
          totalClients: clientsCount || 0,
          upcomingBookings: upcomingCount || 0,
        });
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
        setError("Failed to fetch dashboard statistics");
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}

// Bookings over time data
export function useBookingsOverTime(period: "day" | "week" | "month" = "day") {
  const [data, setData] = useState<Array<{ date: string; bookings: number }>>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBookingsOverTime() {
      try {
        const supabase = supabaseBrowser();

        // Get data for the last 30 days for now
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: bookings } = await supabase
          .from("bookings")
          .select("created_at")
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: true });

        // Group bookings by date
        const groupedData: Record<string, number> = {};

        bookings?.forEach((booking) => {
          const date = new Date(booking.created_at).toISOString().split("T")[0];
          groupedData[date] = (groupedData[date] || 0) + 1;
        });

        const chartData = Object.entries(groupedData).map(
          ([date, bookings]) => ({
            date,
            bookings,
          })
        );

        setData(chartData);
      } catch (err) {
        console.error("Error fetching bookings over time:", err);
        setError("Failed to fetch bookings data");
      } finally {
        setLoading(false);
      }
    }

    fetchBookingsOverTime();
  }, [period]);

  return { data, loading, error };
}

// Revenue by session type
export function useRevenueBySession() {
  const [data, setData] = useState<
    Array<{ sessionType: string; revenue: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRevenueBySession() {
      try {
        const supabase = supabaseBrowser();

        const { data: revenueData } = await supabase
          .from("payments")
          .select(
            `
            amount_cents,
            bookings!inner (
              session_type
            )
          `
          )
          .eq("status", "succeeded");

        // Group revenue by session type
        const groupedRevenue: Record<string, number> = {};

        // Handle different possible data structures
        revenueData?.forEach((payment) => {
          let sessionType = "";

          // Handle different possible structures from Supabase
          if (payment.bookings && typeof payment.bookings === "object") {
            if (Array.isArray(payment.bookings)) {
              // If it's an array, take the first item's session_type
              sessionType = payment.bookings[0]?.session_type || "Unknown";
            } else {
              // If it's an object with session_type
              sessionType = payment.bookings.session_type || "Unknown";
            }
          }

          if (sessionType && payment.amount_cents) {
            groupedRevenue[sessionType] =
              (groupedRevenue[sessionType] || 0) + payment.amount_cents;
          }
        });

        const chartData = Object.entries(groupedRevenue).map(
          ([sessionType, revenue]) => ({
            sessionType,
            revenue: revenue / 100, // Convert cents to dollars
          })
        );

        setData(chartData);
      } catch (err) {
        console.error("Error fetching revenue by session:", err);
        setError("Failed to fetch revenue data");
      } finally {
        setLoading(false);
      }
    }

    fetchRevenueBySession();
  }, []);

  return { data, loading, error };
}

// Popular session categories
export function usePopularCategories() {
  const [data, setData] = useState<Array<{ category: string; count: number }>>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPopularCategories() {
      try {
        const supabase = supabaseBrowser();

        const { data: bookings } = await supabase
          .from("bookings")
          .select("category")
          .not("category", "is", null);

        // Group bookings by category
        const groupedData: Record<string, number> = {};

        bookings?.forEach((booking) => {
          if (booking.category) {
            groupedData[booking.category] =
              (groupedData[booking.category] || 0) + 1;
          }
        });

        const chartData = Object.entries(groupedData).map(
          ([category, count]) => ({
            category,
            count,
          })
        );

        setData(chartData);
      } catch (err) {
        console.error("Error fetching popular categories:", err);
        setError("Failed to fetch categories data");
      } finally {
        setLoading(false);
      }
    }

    fetchPopularCategories();
  }, []);

  return { data, loading, error };
}

// Recent payments
export function useRecentPayments(limit: number = 10) {
  const [data, setData] = useState<PaymentWithBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentPayments() {
      try {
        const supabase = supabaseBrowser();

        const { data: payments } = await supabase
          .from("payments")
          .select(
            `
            *,
            bookings!inner (
              *,
              clients!inner (
                name,
                email
              )
            )
          `
          )
          .order("created_at", { ascending: false })
          .limit(limit);

        setData(payments || []);
      } catch (err) {
        console.error("Error fetching recent payments:", err);
        setError("Failed to fetch recent payments");
      } finally {
        setLoading(false);
      }
    }

    fetchRecentPayments();
  }, [limit]);

  return { data, loading, error };
}

// Event types
export function useEventTypes() {
  const [data, setData] = useState<EventTypeWithParsedFields[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventTypes = async () => {
    try {
      setLoading(true);
      const supabase = supabaseBrowser();

      const { data: eventTypes } = await supabase
        .from("event_types")
        .select("*")
        .order("created_at", { ascending: false });

      setData(eventTypes || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching event types:", err);
      setError("Failed to fetch event types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventTypes();
  }, []);

  return { data, loading, error, refetch: fetchEventTypes };
}

// Bookings with clients (deprecated - use useBookings from use-bookings.ts instead)

// Availability
export function useAvailability(userId?: string) {
  const [data, setData] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const supabase = supabaseBrowser();

        let query = supabase
          .from("availability")
          .select("*")
          .order("day_of_week", { ascending: true });

        if (userId) {
          query = query.eq("user_id", userId);
        }

        const { data: availability } = await query;

        setData(availability || []);
      } catch (err) {
        console.error("Error fetching availability:", err);
        setError("Failed to fetch availability");
      } finally {
        setLoading(false);
      }
    }

    fetchAvailability();
  }, [userId]);

  return { data, loading, error };
}

// Client acquisition (new vs returning)
export function useClientAcquisition() {
  const [data, setData] = useState<
    Array<{ date: string; newClients: number; returningClients: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClientAcquisition() {
      try {
        const supabase = supabaseBrowser();

        // Get data for the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const { data: bookings } = await supabase
          .from("bookings")
          .select(
            `
            created_at,
            clients!inner (
              created_at
            )
          `
          )
          .gte("created_at", thirtyDaysAgo.toISOString())
          .order("created_at", { ascending: true });

        // Process data to determine new vs returning clients
        const dailyData: Record<
          string,
          { newClients: Set<string>; returningClients: Set<string> }
        > = {};

        bookings?.forEach((booking) => {
          const bookingDate = new Date(booking.created_at)
            .toISOString()
            .split("T")[0];
          const clientCreatedDate = new Date(booking.clients.created_at)
            .toISOString()
            .split("T")[0];

          if (!dailyData[bookingDate]) {
            dailyData[bookingDate] = {
              newClients: new Set(),
              returningClients: new Set(),
            };
          }

          // If client was created on the same date as booking, they're new
          if (clientCreatedDate === bookingDate) {
            dailyData[bookingDate].newClients.add(booking.clients.id);
          } else {
            dailyData[bookingDate].returningClients.add(booking.clients.id);
          }
        });

        const chartData = Object.entries(dailyData).map(([date, clients]) => ({
          date,
          newClients: clients.newClients.size,
          returningClients: clients.returningClients.size,
        }));

        setData(chartData);
      } catch (err) {
        console.error("Error fetching client acquisition data:", err);
        setError("Failed to fetch client acquisition data");
      } finally {
        setLoading(false);
      }
    }

    fetchClientAcquisition();
  }, []);

  return { data, loading, error };
}
