import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase-server";
import { BookingWidget } from "@/components/booking/BookingWidget";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getEventTypeBySlug(slug: string) {
  const supabase = await createServerClient();

  const { data: eventType, error } = await supabase
    .from("event_types")
    .select(
      `
      *,
      users (
        id,
        email,
        full_name
      )
    `
    )
    .eq("slug", slug)
    .eq("active", true)
    .single();

  if (error || !eventType) {
    return null;
  }

  return eventType;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const eventType = await getEventTypeBySlug(slug);

  if (!eventType) {
    return {
      title: "Session Not Found",
    };
  }

  return {
    title: `Book ${eventType.title} | ${
      eventType.users?.full_name || "ModFram"
    }`,
    description: eventType.description || `Book a ${eventType.title} session`,
  };
}

export default async function SchedulePage({ params }: Props) {
  const { slug } = await params;
  const eventType = await getEventTypeBySlug(slug);

  if (!eventType) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {eventType.users?.full_name || "ModFram"}
            </h1>
            <h2 className="text-xl text-gray-600 dark:text-gray-300 mb-4">
              {eventType.title}
            </h2>
            {eventType.description && (
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                {eventType.description}
              </p>
            )}
          </div>

          <BookingWidget eventType={eventType} isEmbed={false} />
        </div>
      </div>
    </div>
  );
}
