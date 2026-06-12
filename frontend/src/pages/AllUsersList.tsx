import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Link importálva
import type { AdminUserItemData } from "../dto/user.dto";
import {
  useGetAllUsers,
  useUpdateUserRole,
  useVerifyUser,
} from "../hooks/useUser";
import { getUserId, getUserRole } from "../api/axios";

export default function AllUsersList() {
  const [skip, setSkip] = useState(0);
  const take = 10;
  const navigate = useNavigate();

  const { data: users, isLoading } = useGetAllUsers(skip, take);
  const { mutate: updateStatus, isPending: isUpdatingStatus } = useVerifyUser();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();

  const currentUserId = getUserId();
  const currentUserRole = getUserRole() || "USER";

  // --- JOGOSULTSÁG KEZELÉSE ---
  useEffect(() => {
    if (currentUserRole !== "ADMIN" && currentUserRole !== "SUPER_ADMIN") {
      navigate("/dashboard");
    }
  }, [currentUserRole, navigate]);

  const canEditRole = (targetRole: string) => {
    if (currentUserRole === "SUPER_ADMIN") return targetRole !== "SUPER_ADMIN";
    if (currentUserRole === "ADMIN")
      return targetRole !== "SUPER_ADMIN" && targetRole !== "ADMIN";
    return false;
  };

  const getAvailableRoles = () => {
    if (currentUserRole === "SUPER_ADMIN")
      return ["USER", "MODERATOR", "ADMIN"];
    if (currentUserRole === "ADMIN") return ["USER", "MODERATOR"];
    return [];
  };

  const canPerformStatusAction = (targetUserRole: string) => {
    if (currentUserRole === "SUPER_ADMIN")
      return targetUserRole !== "SUPER_ADMIN";
    if (currentUserRole === "ADMIN")
      return targetUserRole !== "ADMIN" && targetUserRole !== "SUPER_ADMIN";
    return false;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-50 text-green-700 border-green-200";
      case "PENDING":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      case "BANNED":
        return "bg-stone-800 text-white border-stone-800";
      default:
        return "bg-stone-50 text-stone-500 border-stone-200";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto font-inter px-4 sm:px-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="font-[var(--font-playfair)] text-4xl font-bold text-background mb-2 tracking-tight">
            Manage Users
          </h2>
          <p className="text-stone-500 text-sm">
            Approve registrations, manage roles, and enforce platform rules.
          </p>
        </div>
        <div className="bg-stone-100 px-4 py-2 rounded-xl border border-stone-200 flex items-center gap-2 shadow-sm">
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-stone-500">
            Your Role:
          </span>
          <span className="text-xs font-bold text-[var(--color-primary)] uppercase tracking-wider">
            {currentUserRole}
          </span>
        </div>
      </div>

      <div className="bg-white border border-stone-200 rounded-3xl shadow-sm overflow-hidden flex flex-col">
        {users?.length === 0 ? (
          <div className="p-10 text-center text-stone-500 font-medium">
            No users found.
          </div>
        ) : (
          users?.map((user: AdminUserItemData) => {
            const isSelf = user.id === currentUserId;
            const roleEditable = canEditRole(user.role) && !isSelf;
            const statusEditable = canPerformStatusAction(user.role) && !isSelf;

            return (
              <div
                key={user.id}
                className="p-6 border-b border-stone-100 last:border-0 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6 hover:bg-stone-50/50 transition-colors"
              >
                {/* Bal oldal: Letisztult adatok, kattintható névvel */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/user/${user.id}`}
                      className="font-bold text-background text-lg hover:text-[var(--color-primary)] transition-colors underline-offset-4 hover:underline"
                    >
                      {user.firstName || "Unknown"} {user.lastName || ""}
                    </Link>
                    {isSelf && (
                      <span className="bg-[var(--color-primary)] text-white text-[8px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-stone-500 font-medium mt-0.5">
                    @{user.username} • {user.email}
                  </span>
                </div>

                {/* Jobb oldal: Admin vezérlők */}
                <div className="flex items-center gap-4 flex-wrap w-full xl:w-auto xl:justify-end">
                  <span
                    className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm ${getStatusBadge(user.status)}`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75"></span>
                    {user.status}
                  </span>

                  <div className="flex flex-col gap-1 border-l border-stone-200 pl-4">
                    <label className="text-[9px] font-bold uppercase tracking-[0.2em] text-stone-400">
                      Role
                    </label>
                    <select
                      disabled={isUpdatingRole || !roleEditable}
                      value={user.role}
                      onChange={(e) => {
                        const newRole = e.target.value as
                          | "USER"
                          | "MODERATOR"
                          | "ADMIN"
                          | "SUPER_ADMIN";
                        if (window.confirm(`Change role to ${newRole}?`)) {
                          updateRole({ userId: user.id, newRole });
                        }
                      }}
                      className="bg-white border border-stone-200 text-stone-700 text-[11px] font-bold uppercase tracking-wider rounded-lg px-2 py-1.5 outline-none focus:border-[var(--color-primary)] disabled:opacity-60 cursor-pointer shadow-sm transition-colors"
                    >
                      <option value={user.role}>{user.role}</option>
                      {roleEditable &&
                        getAvailableRoles()
                          .filter((r) => r !== user.role)
                          .map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                    </select>
                  </div>

                  {statusEditable && (
                    <div className="flex items-center gap-2 border-l border-stone-200 pl-4 ml-2">
                      {user.status === "PENDING" && (
                        <>
                          <button
                            disabled={isUpdatingStatus}
                            onClick={() =>
                              updateStatus({
                                userId: user.id,
                                status: "VERIFIED",
                              })
                            }
                            className="bg-green-600 hover:bg-green-700 text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm"
                          >
                            Approve
                          </button>
                          <button
                            disabled={isUpdatingStatus}
                            onClick={() =>
                              updateStatus({
                                userId: user.id,
                                status: "REJECTED",
                              })
                            }
                            className="bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {user.status === "VERIFIED" && (
                        <button
                          disabled={isUpdatingStatus}
                          onClick={() =>
                            updateStatus({ userId: user.id, status: "BANNED" })
                          }
                          className="bg-stone-800 hover:bg-black text-white text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm"
                        >
                          Ban
                        </button>
                      )}
                      {user.status === "BANNED" && (
                        <button
                          disabled={isUpdatingStatus}
                          onClick={() =>
                            updateStatus({
                              userId: user.id,
                              status: "VERIFIED",
                            })
                          }
                          className="bg-white border border-stone-300 text-stone-600 hover:border-background hover:text-background text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-sm"
                        >
                          Unban
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-8 flex justify-center items-center gap-4">
        <button
          onClick={() => setSkip((p) => Math.max(0, p - take))}
          disabled={skip === 0}
          className="px-6 py-2.5 bg-white border border-stone-200 text-stone-600 text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl hover:border-background transition-colors disabled:opacity-40"
        >
          Previous
        </button>
        <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">
          Page {Math.floor(skip / take) + 1}
        </span>
        <button
          onClick={() => setSkip((p) => p + take)}
          disabled={!users || users.length < take}
          className="px-6 py-2.5 bg-white border border-stone-200 text-stone-600 text-[10px] font-bold tracking-[0.2em] uppercase rounded-xl hover:border-background transition-colors disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
}
