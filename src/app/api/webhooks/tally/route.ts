import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase-server";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (optional but recommended)
    const headersList = await headers();
    const signature = headersList.get("tally-signature");
    // TODO: Implement signature verification for webhook security

    // Parse the webhook payload
    const body = await request.json();

    // Validate required fields
    if (!body.eventId || !body.eventType || !body.createdAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Only process form submission events
    if (body.eventType !== "FORM_RESPONSE") {
      return NextResponse.json({ message: "Event ignored" }, { status: 200 });
    }

    const supabase = supabaseServer();

    // Extract form response data
    const {
      eventId,
      createdAt,
      formId,
      formName,
      respondentId,
      fields = {},
    } = body;

    // Look for booking_draft_id in the form fields or URL parameters
    let bookingDraftId = null;

    // Check if booking_draft_id is in the form fields
    if (fields.booking_draft_id) {
      bookingDraftId = fields.booking_draft_id;
    }

    // Check if it's in the URL parameters (common for embedded forms)
    if (body.urlParameters?.booking_draft_id) {
      bookingDraftId = body.urlParameters.booking_draft_id;
    }

    // Check if it's in hidden fields
    if (body.hiddenFields?.booking_draft_id) {
      bookingDraftId = body.hiddenFields.booking_draft_id;
    }

    // Store the Tally submission
    const { data: submission, error: submissionError } = await supabase
      .from("tally_submissions")
      .insert({
        event_id: eventId,
        form_id: formId,
        form_name: formName,
        respondent_id: respondentId,
        booking_draft_id: bookingDraftId,
        fields: fields,
        raw_payload: body,
        created_at: new Date(createdAt).toISOString(),
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Error storing Tally submission:", submissionError);
      return NextResponse.json(
        { error: "Failed to store submission" },
        { status: 500 }
      );
    }

    // If we have a booking_draft_id, update the booking with form completion
    if (bookingDraftId) {
      const { error: bookingError } = await supabase
        .from("bookings")
        .update({
          tally_submission_id: submission.id,
          form_completed: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bookingDraftId);

      if (bookingError) {
        console.error("Error updating booking:", bookingError);
        // Don't fail the webhook, submission is already stored
      }
    }

    return NextResponse.json(
      {
        message: "Webhook processed successfully",
        submissionId: submission.id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Tally webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Handle GET requests for webhook verification
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const challenge = searchParams.get("challenge");

  if (challenge) {
    return NextResponse.json({ challenge });
  }

  return NextResponse.json({ message: "Tally webhook endpoint" });
}
