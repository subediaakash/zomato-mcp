"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FcGoogle } from "react-icons/fc";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function SigninPage() {
    const googleSignIn = async () => {
        const data = await authClient.signIn.social({
            provider: "google",
        });
        if (!data.error) {
            redirect("/");
        } else {
            console.error("Error occurred");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white px-4">
            <Card className="w-full max-w-md rounded-2xl border border-gray-200 shadow-[0_4px_20px_rgba(226,55,68,0.15)]">
                <CardContent className="p-8 flex flex-col items-center space-y-8">
                    {/* Zomato-style heading */}
                    <h2 className="text-3xl font-extrabold text-[#E23744] tracking-tight">
                        Welcome Back
                    </h2>

                    <p className="text-gray-600 text-center">
                        Sign in to continue discovering amazing food
                    </p>

                    <div className="w-full">
                        <Button
                            onClick={googleSignIn}
                            className="flex items-center justify-center gap-3 w-full bg-white border border-gray-300 text-gray-800 hover:bg-gray-50 transition-all rounded-full py-6 text-base font-semibold shadow-sm"
                        >
                            <FcGoogle className="text-2xl" />
                            Continue with Google
                        </Button>
                    </div>

                    <div className="flex items-center w-full">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="mx-3 text-gray-400 text-sm">or</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <p className="text-gray-500 text-sm text-center">
                        Don’t have an account?{" "}
                        <a href="/signup" className="text-[#E23744] hover:underline">
                            Sign up
                        </a>
                    </p>

                    <p className="text-gray-400 text-xs text-center mt-4">
                        By signing in, you agree to our{" "}
                        <a href="#" className="text-[#E23744] hover:underline">
                            Terms of Service
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-[#E23744] hover:underline">
                            Privacy Policy
                        </a>.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
