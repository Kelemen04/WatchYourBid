import { useState } from "react";
import { useAllTransactions } from "../hooks/useTransactions";

export default function AllTransactionsList() {
  const [page, setPage] = useState(0);
  const take = 10;
  const skip = page * take;

  const {
    data: transactions,
    isLoading,
    isFetching,
  } = useAllTransactions(skip, take);

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
      <div className="flex justify-between items-end mb-6 border-b border-text-muted/20 pb-2">
        <h2 className="font-playfair text-4xl font-bold text-background">
          All Transaction History
        </h2>
        {isFetching && page > 0 && (
          <span className="text-sm text-primary animate-pulse">
            Updating...
          </span>
        )}
      </div>

      {transactions && transactions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {transactions.map((t) => {
            const isReceive =
              t.type.includes("RECEIVE") || t.type.includes("UPLOAD");

            return (
              <div
                key={t.id}
                className="flex flex-row justify-between items-center bg-white border border-text-muted/40 p-4 rounded-xl transition-colors hover:border-primary/50"
              >
                <div className="flex flex-col gap-1 flex-1">
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

                {/* Középső rész: Felhasználó adatai */}
                <div className="flex flex-col gap-1 flex-1 items-center border-x border-text-muted/10 px-4">
                  <span className="text-sm font-bold text-background uppercase tracking-wider">
                    {t.user?.username || `User #${t.userId}`}
                  </span>
                  <span className="text-[10px] text-text-muted tracking-widest">
                    {t.user?.email || "Platform Transaction"}
                  </span>
                </div>

                {/* Jobb oldal: Összeg és Státusz */}
                <div className="flex flex-col items-end gap-1 flex-1">
                  <span className="font-inter text-xl font-bold text-background">
                    <span>{isReceive ? "+" : "-"}</span>€
                    {t.amount.toLocaleString()}
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

          {/* AKTUÁLIS OLDALSZÁM */}
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
