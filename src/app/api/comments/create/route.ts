import { NextResponse } from "next/server";

const API_URL = "https://script.google.com/macros/s/AKfycbxpnaqm3UoeUChFJNpqxmkK4Ku2wXzrppezwR5mJYkFSyldFz2PJ2uAYtTgj8yIZA/exec";
const SHEET_ID = "1Rfapx_mxA-AAlRyz6NyJnwvelsLDZpzqbaWrvAP6XsE";

export async function POST(request: Request) {
    try {
        const { user_id, post_id, content, comments_count } = await request.json();

        if (!user_id || !post_id || !content) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        const newComment = {
            method: "create",
            sheetId: SHEET_ID,
            sheet: "comments",
            id: Date.now().toString(),
            user_id,
            post_id,
            content,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        // Create comment
        const commentResponse = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newComment),
        });

        const commentResult = await commentResponse.json();

        if (!commentResult.success) {
            return NextResponse.json({ success: false, error: "Failed to add comment" }, { status: 500 });
        }

        // Update comment_count in the post
        const updateCommentCount = {
            method: "update",
            sheetId: SHEET_ID,
            sheet: "posts",
            id: post_id,
            comment_count: comments_count +1,
        };

        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updateCommentCount),
        });

        return NextResponse.json({ success: true, comment: newComment }, { status: 201 });

    } catch (error) {
        console.error("Error posting comment:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
