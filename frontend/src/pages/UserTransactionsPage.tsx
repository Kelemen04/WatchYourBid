import { useState } from "react";
import { useMyTransactions } from "../hooks/useTransactions";

export default function UserTransactionsPage() {
  const [page, setPage] = useState(0);
  const take = 10;
  const skip = page * take;

  const { data: transactions, isLoading } = useMyTransactions(skip, take);

  if (isLoading && page === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <span className="font-playfair text-2xl text-primary animate-pulse">
          Loading transactions...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px]">
      <h2 className="font-playfair text-4xl font-bold text-background mb-6 border-b border-text-muted/20 pb-2">
        Transaction History
      </h2>

      {transactions && transactions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {transactions.map((t) => {
            const isReceive =
              t.type.includes("RECEIVE") ||
              t.type.includes("UPLOAD") ||
              t.type.includes("DEPOSIT");

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
        <div className="text-center py-20 bg-white border border-text-muted/20 rounded-2xl shadow-sm">
          <p className="text-text-muted text-lg uppercase tracking-widest">
            No transactions found.
          </p>
        </div>
      )}

      {!isLoading && (
        <div className="mt-8 flex justify-center items-center gap-8">
          <button
            onClick={() => setPage((old) => Math.max(old - 1, 0))}
            disabled={page === 0}
            className={`w-36 flex justify-center items-center py-2.5 font-bold uppercase tracking-wider text-xs border rounded-lg transition-colors ${
              page === 0
                ? "border-text-muted/20 text-text-muted/50 cursor-not-allowed bg-gray-50"
                : "border-text-muted/40 text-background hover:border-primary hover:bg-primary hover:text-white"
            }`}
          >
            &larr; Previous
          </button>

          <span className="font-inter font-bold text-background text-sm uppercase tracking-widest w-20 text-center shrink-0">
            Page {page + 1}
          </span>

          <button
            onClick={() => setPage((old) => old + 1)}
            disabled={!transactions || transactions.length < take}
            className={`w-36 flex justify-center items-center py-2.5 font-bold uppercase tracking-wider text-xs border rounded-lg transition-colors ${
              !transactions || transactions.length < take
                ? "border-text-muted/20 text-text-muted/50 cursor-not-allowed bg-gray-50"
                : "border-text-muted/40 text-background hover:border-primary hover:bg-primary hover:text-white"
            }`}
          >
            Next &rarr;
          </button>
        </div>
      )}
    </div>
  );
}
