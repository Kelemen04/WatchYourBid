import { useMyTransactions } from "../hooks/useTransactions";

export default function UserTransactionsPage() {
  const { data: transactions, isLoading } = useMyTransactions();

  if (isLoading) return <div>Loading transactions...</div>;

  return (
    <div>
      <h2 style={{ margin: "0 0 15px 0" }}>Transaction History</h2>
      {transactions && transactions.length > 0 ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {transactions.map((t) => (
            <div
              key={t.id}
              style={{
                border: "1px solid #ccc",
                padding: "10px",
                display: "flex",
                justifyContent: "space-between",
                backgroundColor: "#fafafa",
              }}
            >
              <div>
                <span
                  style={{
                    fontWeight: "bold",
                    color: t.type.includes("RECEIVE") ? "green" : "darkred",
                  }}
                >
                  {t.type}
                </span>
                <span
                  style={{
                    marginLeft: "10px",
                    fontSize: "12px",
                    color: "gray",
                  }}
                >
                  {new Date(t.createdAt).toLocaleDateString()}
                </span>
              </div>
              <span style={{ fontWeight: "bold" }}>
                {t.amount} EUR ({t.status})
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p>No transactions found.</p>
      )}
    </div>
  );
}
