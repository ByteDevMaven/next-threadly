import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        const { id, name, email, password } = await request.json();

        if (!id || !name || !email) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        let hashedPassword = undefined;
        if (password) {
            hashedPassword = await bcrypt.hash(password, 10); // Hash password if provided
        }

        const updateData = {
            method: "update",
            sheetId: "1Rfapx_mxA-AAlRyz6NyJnwvelsLDZpzqbaWrvAP6XsE",
            sheet: "users",
            id,
            name,
            email,
            ...(hashedPassword && { password: hashedPassword }), // Only include password if updated
            updated_at: new Date().toISOString(),
        };

        const response = await fetch(
            "https://script.google.com/macros/s/AKfycbxpnaqm3UoeUChFJNpqxmkK4Ku2wXzrppezwR5mJYkFSyldFz2PJ2uAYtTgj8yIZA/exec",
            {
                method: "POST",
                body: JSON.stringify(updateData),
                headers: { "Content-Type": "application/json" },
            }
        );

        const result = await response.json();

        if (result.success) {
            return NextResponse.json({ success: true }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, error: result.error || "Failed to update profile" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error updating user info:", error);
        return NextResponse.json({ success: false, error: "An error occurred while updating your profile" }, { status: 500 });
    }
}
