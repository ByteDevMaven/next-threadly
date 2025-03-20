import { NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import cookie from "cookie";
import bcrypt from "bcryptjs";

const SECRET_KEY: string = process.env.NEXT_PUBLIC_JWT_SECRET || "";

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        // Fetch user from Google Sheets
        const userRes = await fetch(
            `https://script.google.com/macros/s/AKfycbxpnaqm3UoeUChFJNpqxmkK4Ku2wXzrppezwR5mJYkFSyldFz2PJ2uAYtTgj8yIZA/exec?sheetId=1Rfapx_mxA-AAlRyz6NyJnwvelsLDZpzqbaWrvAP6XsE&sheet=users&filterKey=email&filterValue=${email}`
        );
        const userData = await userRes.json();

        if (!userData.success || userData.message.data.length === 0) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        const user = userData.message.data[0];

        // ✅ Secure password verification
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user.id, name: user.name, email: user.email, password: user.password, created_at: user.created_at },
            SECRET_KEY,
            { expiresIn: "1h" }
        );

        // Set token as HTTP-only cookie
        const response = NextResponse.json({ message: "Login successful" }, { status: 200 });

        response.headers.set(
            "Set-Cookie",
            cookie.serialize("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
                path: "/",
            })
        );

        return response;
    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
