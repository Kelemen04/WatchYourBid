import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import api from "../api/axios";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();

  const sessionId = searchParams.get("session_id");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState(
    "Please wait,we're verifing your payment ...",
  );
  useEffect(() => {
    if (!sessionId) {
      return;
    }

    api
      .post("/transaction/confirm-payment", { sessionId })
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message || "Payment successful!");

        queryClient.invalidateQueries({ queryKey: ["user"] });
        queryClient.invalidateQueries({ queryKey: ["wallet"] });
      })
      .catch((err) => {
        setStatus("error");
        setMessage(
          err.response?.data?.error || "We couldn't accept your payment.",
        );
      });
  }, [sessionId, queryClient]);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "40px",
        border: "1px solid gray",
        margin: "50px auto",
        maxWidth: "500px",
      }}
    >
      {status === "loading" && (
        <div>
          <h2 style={{ color: "orange" }}>Verifing...</h2>
          <p>{message}</p>
        </div>
      )}

      {status === "success" && (
        <div>
          <h2 style={{ color: "green" }}>Successful payment!</h2>
          <p style={{ margin: "15px 0" }}>{message}</p>
        </div>
      )}

      {status === "error" && (
        <div>
          <h2 style={{ color: "red" }}>Error!</h2>
          <p style={{ margin: "15px 0", color: "darkred", fontWeight: "bold" }}>
            {message}
          </p>
        </div>
      )}

      <div style={{ marginTop: "30px" }}>
        <Link
          to="/dashboard"
          style={{
            padding: "10px 20px",
            border: "1px solid black",
            background: "#f0f0f0",
            textDecoration: "none",
            color: "black",
          }}
        >
          Back to home page
        </Link>
      </div>
    </div>
  );
}
