import { useMyTransactions } from "../hooks/useTransactions";

export default function UserTransactionsPage() {
  const { data: transactions, isLoading } = useMyTransactions();

  if (isLoading) {
    return (
      <div className="text-text-muted font-bold tracking-widest uppercase text-sm">
        Loading transactions...
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-playfair text-4xl font-bold text-background mb-6 border-b border-border pb-2">
        Transaction History
      </h2>

      {transactions && transactions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {transactions.map((t) => {
            const isReceive =
              t.type.includes("RECEIVE") || t.type.includes("UPLOAD");

            return (
              <div
                key={t.id}
                className="flex justify-between items-center bg-white border border-text-muted/40 p-4 rounded-xl transition-colors hover:border-primary/50"
              >
                <div className="flex flex-col gap-1">
                  <span
                    className={`text-lg font-bold uppercase tracking-widest ${
                      isReceive ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {t.type.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] text-text-muted uppercase tracking-wider">
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="font-inter text-xl font-bold text-background">
                    <span
                      className={
                        isReceive ? "text-emerald-500" : "text-red-500"
                      }
                    >
                      {isReceive ? "+" : "-"}
                    </span>
                    €{t.amount.toLocaleString()}
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-background">
                    Status: <span className="text-primary">{t.status}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-[var(--color-text-muted)] text-sm uppercase tracking-widest">
          No transactions found.
        </p>
      )}
    </div>
  );
}
