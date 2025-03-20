import { NextResponse } from "next/server";

const API_URL = "https://script.google.com/macros/s/AKfycbxpnaqm3UoeUChFJNpqxmkK4Ku2wXzrppezwR5mJYkFSyldFz2PJ2uAYtTgj8yIZA/exec";
const SHEET_ID = "1Rfapx_mxA-AAlRyz6NyJnwvelsLDZpzqbaWrvAP6XsE";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("id");
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("limit") || "5";

        const discussionsUrl = `${API_URL}?sheetId=${SHEET_ID}&sheet=posts&filterKey=user_id&filterValue=${userId}&limit=${limit}&page=${page}`;
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