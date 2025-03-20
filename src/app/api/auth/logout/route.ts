import { NextResponse } from "next/server";
import * as cookie from "cookie";

export async function POST() {
    const response = NextResponse.json({ message: "Logged out successfully" });

    response.headers.set(
        "Set-Cookie",
        cookie.serialize("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            expires: new Date(0), // Expire the cookie immediately
        })
    );

    return response;
}
