import { NextResponse } from "next/server";
import { checkAuth } from "../../../utils/auth";

export async function GET(request: Request) {
  const user = await checkAuth(request);
  if (user) {
    return NextResponse.json(user, { status: 200 });
  } else {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
  }
}
