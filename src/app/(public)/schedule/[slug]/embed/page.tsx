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

export default async function EmbedPage({ params }: Props) {
  const { slug } = await params;
  const eventType = await getEventTypeBySlug(slug);

  if (!eventType) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {eventType.title}
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            with {eventType.users?.full_name || "ModFram"}
          </p>
        </div>

        <BookingWidget eventType={eventType} isEmbed={true} />
      </div>

      {/* Auto-resize script for iframe embedding */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            function resizeIframe() {
              const height = document.documentElement.scrollHeight;
              window.parent.postMessage({
                type: 'resize',
                height: height
              }, '*');
            }

            // Initial resize
            resizeIframe();

            // Resize on content changes
            const observer = new ResizeObserver(resizeIframe);
            observer.observe(document.body);

            // Resize on window resize
            window.addEventListener('resize', resizeIframe);
          `,
        }}
      />
    </div>
  );
}
