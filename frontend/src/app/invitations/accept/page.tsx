"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { postData } from "@/lib/api";

export default function AcceptInvitationPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      acceptInvitationToken(token);
    } else {
      setError("No invitation token provided");
      setLoading(false);
    }
  }, [searchParams]);

  const acceptInvitationToken = async (token: string) => {
    try {
      // Accept invitation using the API
      // We need to call the specific endpoint with the token in the URL
      const response = await postData(`/invitations/${token}/accept`, {});
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Set the organization ID in localStorage
      if (response.organizationId) {
        localStorage.setItem('current_org_id', response.organizationId);
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Failed to accept invitation");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Processing Invitation...</h1>
        <p className="text-lg text-gray-600">Please wait while we process your invitation.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Error</h1>
        <p className="text-red-500">{error}</p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-4">Invitation Accepted!</h1>
        <p className="text-lg text-gray-600 mb-6">
          You have successfully joined the organization.
        </p>
        <button 
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Unexpected Error</h1>
      <p className="text-lg text-gray-600">
        Something went wrong. Please try again.
      </p>
      <button 
        onClick={() => router.push("/dashboard")}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Go to Dashboard
      </button>
    </div>
  );
}