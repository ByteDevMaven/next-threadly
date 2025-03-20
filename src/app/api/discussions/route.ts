import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';

const API_URL = "https://script.google.com/macros/s/AKfycbxpnaqm3UoeUChFJNpqxmkK4Ku2wXzrppezwR5mJYkFSyldFz2PJ2uAYtTgj8yIZA/exec";
const SHEET_ID = "1Rfapx_mxA-AAlRyz6NyJnwvelsLDZpzqbaWrvAP6XsE";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("limit") || "5";

        const discussionsUrl = `${API_URL}?sheetId=${SHEET_ID}&sheet=posts&limit=${limit}&page=${page}`;
        const response = await fetch(discussionsUrl);
        const data = await response.json();

        if (!data.success) {
            return NextResponse.json({ success: false, error: "Failed to fetch discussions" }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: data.message.data, page: data.message.page, totalPages: data.message.totalPages });
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ message: "Internal server error", error: errorMessage }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { user_id, author, title, content } = await request.json();

        if (!user_id || !title || !content) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const newDiscussion = {
            method: "create",
            sheetId: SHEET_ID,
            sheet: "posts",
            id: uuidv4(), 
            user_id,
            author,
            title,
            content,
            comment_count: "0", 
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newDiscussion),
        });

        const result = await response.json();

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error || "Failed to create discussion" }, { status: 500 });
        }

        return NextResponse.json({ success: true, discussion: newDiscussion }, { status: 201 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ message: "Internal server error", error: errorMessage }, { status: 500 });
    }
}
