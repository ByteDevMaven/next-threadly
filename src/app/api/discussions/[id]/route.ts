import { NextResponse } from "next/server";

const API_URL = "https://script.google.com/macros/s/AKfycbxpnaqm3UoeUChFJNpqxmkK4Ku2wXzrppezwR5mJYkFSyldFz2PJ2uAYtTgj8yIZA/exec";
const SHEET_ID = "1Rfapx_mxA-AAlRyz6NyJnwvelsLDZpzqbaWrvAP6XsE";

export async function GET(request: Request, context: { params: { id: string } }) {
    try {
        const { id } = await context.params; 

        if (!id) {
            return NextResponse.json({ success: false, error: "Discussion ID is required" }, { status: 400 });
        }

        const discussionUrl = `${API_URL}?sheetId=${SHEET_ID}&sheet=posts&filterKey=id&filterValue=${id}`;
        const commentsUrl = `${API_URL}?sheetId=${SHEET_ID}&sheet=comments&filterKey=post_id&filterValue=${id}`;
        const usersUrl = `${API_URL}?sheetId=${SHEET_ID}&sheet=users`;

        const [discussionRes, commentsRes, usersRes] = await Promise.all([
            fetch(discussionUrl),
            fetch(commentsUrl),
            fetch(usersUrl)
        ]);

        const discussionData = await discussionRes.json();
        const commentsData = await commentsRes.json();
        const usersData = await usersRes.json();

        if (!discussionData.success || discussionData.message.data.length === 0) {
            return NextResponse.json({ success: false, error: "Discussion not found" }, { status: 404 });
        }

        const usersMap = new Map();
        if (usersData.success) {
            usersData.message.data.forEach((user: any) => {
                usersMap.set(user.id, user.name);
            });
        }

        // Attach `author` to comments
        const commentsWithAuthors = commentsData.success
            ? commentsData.message.data.map((comment: any) => ({
                  ...comment,
                  author: usersMap.get(comment.user_id) || "Unknown",
              }))
            : [];

        return NextResponse.json({
            success: true,
            discussion: discussionData.message.data[0],
            comments: commentsWithAuthors,
        });

    } catch (error) {
        console.error("Error fetching discussion:", error);
        return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
    }
}
