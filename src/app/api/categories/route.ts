import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const { data: categories, error } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId)
      .order("name");

    if (error) {
      console.error("Error fetching categories:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(categories || []);
  } catch (error) {
    console.error("Error in GET /api/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, color, description, user_id } = body;

    if (!name?.trim() || !user_id) {
      return NextResponse.json(
        { error: "Name and user_id are required" },
        { status: 400 }
      );
    }

    const { data: category, error } = await supabase
      .from("categories")
      .insert({
        name: name.trim(),
        color: color || "blue",
        description: description?.trim() || null,
        user_id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A category with this name already exists" },
          { status: 409 }
        );
      }
      console.error("Error creating category:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error in POST /api/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, color, description, user_id } = body;

    if (!id || !name?.trim() || !user_id) {
      return NextResponse.json(
        { error: "ID, name, and user_id are required" },
        { status: 400 }
      );
    }

    const { data: category, error } = await supabase
      .from("categories")
      .update({
        name: name.trim(),
        color: color || "blue",
        description: description?.trim() || null,
      })
      .eq("id", id)
      .eq("user_id", user_id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "A category with this name already exists" },
          { status: 409 }
        );
      }
      console.error("Error updating category:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error in PUT /api/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("user_id");

    if (!id || !userId) {
      return NextResponse.json(
        { error: "ID and user_id are required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting category:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE /api/categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
