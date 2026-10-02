import { NextResponse } from "next/server";

const SESSION_COOKIE = "njis-session";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { username, password } = body;

    const validUsername =
      process.env.NJIS_LOGIN_USERNAME;

    const validPassword =
      process.env.NJIS_LOGIN_PASSWORD;

    const sessionSecret =
      process.env.NJIS_SESSION_SECRET;

    if (
      !validUsername ||
      !validPassword ||
      !sessionSecret
    ) {
      console.error(
        "NJIS authentication environment variables are not configured."
      );

      return NextResponse.json(
        {
          error:
            "Login service is not configured.",
        },
        { status: 500 }
      );
    }

    if (
      username !== validUsername ||
      password !== validPassword
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: {
        name: "Admissions Team",
        username: validUsername,
        role: "Admissions Team",
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE,
      value: sessionSecret,
      httpOnly: true,
      secure:
        process.env.NODE_ENV ===
        "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return response;
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Unable to process login.",
      },
      { status: 500 }
    );
  }
}