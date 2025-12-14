'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function CallbackPage() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // Get tokens from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get("access_token");
    const refreshToken = urlParams.get("refresh_token");

    if (accessToken && refreshToken) {
      // Use the login function from AuthContext to store tokens
      login({ access_token: accessToken, refresh_token: refreshToken });
    } else {
      // If no tokens, redirect to login
      router.push("/auth/login");
    }
  }, [router, login]);

  return <p>Logging you in...</p>;
}