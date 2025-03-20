import { NextResponse } from "next/server";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
    try {
        let { name, email, password } = await request.json();

        // Check if the user already exists
        const userRes = await fetch(
            `https://script.google.com/macros/s/AKfycbxpnaqm3UoeUChFJNpqxmkK4Ku2wXzrppezwR5mJYkFSyldFz2PJ2uAYtTgj8yIZA/exec?sheetId=1Rfapx_mxA-AAlRyz6NyJnwvelsLDZpzqbaWrvAP6XsE&sheet=users&filterKey=email&filterValue=${email}`
        );
        const userData = await userRes.json();

        if (userData.success && userData.message.data.length > 0) {
            return NextResponse.json({ message: "User already exists" }, { status: 409 });
        }

        password = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            method: "create",
            sheetId: "1Rfapx_mxA-AAlRyz6NyJnwvelsLDZpzqbaWrvAP6XsE",
            sheet: "users",
            id: uuidv4(),
            name,
            email,
            password,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        const createUserRes = await fetch(
            "https://script.google.com/macros/s/AKfycbxpnaqm3UoeUChFJNpqxmkK4Ku2wXzrppezwR5mJYkFSyldFz2PJ2uAYtTgj8yIZA/exec",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            }
        );

        const createUserData = await createUserRes.json();

        if (!createUserData.success) {
            return NextResponse.json({ message: "Failed to create user" }, { status: 500 });
        }

        return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
