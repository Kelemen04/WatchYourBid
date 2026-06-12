import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";
import { MdDoneOutline } from "react-icons/md";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState(
    "Please wait, we're verifying your payment...",
  );

  useEffect(() => {
    if (!sessionId) {
      const timeoutId = setTimeout(() => {
        setStatus("error");
        setMessage("Invalid payment session. No session ID found.");
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    api
      .post("/transaction/confirm-payment", { sessionId })
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Payment successful!");

        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
        queryClient.invalidateQueries({ queryKey: ["me"] });
        queryClient.invalidateQueries({ queryKey: ["navbar"] });
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.error || "We couldn't accept your payment.",
        );
      });
  }, [sessionId, queryClient]);

  return (
    <div className="flex items-center justify-center w-full min-h-[calc(100vh-80px)] p-4 bg-slate-50 mt-20">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-text-muted/20 p-10 flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center items-center h-24">
          {status === "loading" && (
            <div className="w-16 h-16 border-4 border-text-muted/20 border-t-primary rounded-full animate-spin"></div>
          )}

          {status === "success" && (
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center border-4 border-green-400">
              <MdDoneOutline className="text-3xl text-green-600" />
            </div>
          )}

          {status === "error" && (
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="3"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Text */}
        <div className="mb-8">
          <h2 className="font-playfair text-3xl font-bold text-background mb-3">
            {status === "loading" && "Verifying..."}
            {status === "success" && "Payment Successful!"}
            {status === "error" && "Payment Failed"}
          </h2>
          <p
            className={`font-inter text-sm ${status === "error" ? "text-red-600 font-medium" : "text-text-muted"}`}
          >
            {message}
          </p>
        </div>

        {/* Button */}
        {status !== "loading" && (
          <div className="w-full mt-2 border-t border-gray-100 pt-6">
            <Link
              to="/dashboard"
              className="inline-block w-full text-white bg-background hover:bg-primary hover:text-white font-bold tracking-widest uppercase rounded-2xl text-sm px-8 py-4 transition-all shadow-md"
            >
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
