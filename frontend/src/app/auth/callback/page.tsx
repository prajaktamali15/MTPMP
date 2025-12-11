'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CallbackPage() {
  const router = useRouter();
  const { loginWithToken } = useAuth();

  useEffect(() => {
    // Get tokens from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");

    if (accessToken && refreshToken) {
      // Store tokens and redirect to dashboard
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      router.push("/dashboard");
    } else {
      // If no tokens, redirect to login
      router.push("/auth/login");
    }
  }, [router, loginWithToken]);

  return <p>Logging you in...</p>;
}