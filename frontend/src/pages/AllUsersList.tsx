import { useState } from "react";
import type { AdminUserItemData } from "../dto/user.dto";
import {
  useGetAllUsers,
  useUpdateUserRole,
  useVerifyUser,
} from "../hooks/useUser";

export default function AllUsersList() {
  const [skip, setSkip] = useState(0);
  const take = 20;

  const { data: users, isLoading } = useGetAllUsers(skip, take);
  const { mutate: verifyUser, isPending: isVerifying } = useVerifyUser();
  const { mutate: updateRole, isPending: isUpdatingRole } = useUpdateUserRole();

  if (isLoading) return <div>Felhasználók betöltése...</div>;

  return (
    <div>
      <h2
        style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}
      >
        Manage Users
      </h2>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {users?.map((user: AdminUserItemData) => (
          <div
            key={user.id}
            style={{
              border: "1px solid black",
              padding: "10px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <strong>
                #{user.id} - @{user.username}
              </strong>
              <p style={{ margin: "5px 0" }}>
                Name: {user.firstName} {user.lastName} | Email: {user.email}
              </p>
              <p style={{ margin: "5px 0" }}>
                Status: <b>{user.status}</b> | Role: <b>{user.role}</b>
              </p>
            </div>

            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              {user.status === "PENDING" && (
                <div style={{ display: "flex", gap: "5px" }}>
                  <button
                    disabled={isVerifying}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to approve this user?",
                        )
                      ) {
                        verifyUser({ userId: user.id, status: "VERIFIED" });
                      }
                    }}
                    style={{
                      backgroundColor: "green",
                      color: "white",
                      padding: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Jóváhagyás
                  </button>
                  <button
                    disabled={isVerifying}
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to reject this user?",
                        )
                      ) {
                        verifyUser({ userId: user.id, status: "REJECTED" });
                      }
                    }}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      padding: "5px",
                      cursor: "pointer",
                    }}
                  >
                    Elutasítás
                  </button>
                </div>
              )}

              <div
                style={{ display: "flex", flexDirection: "column", gap: "5px" }}
              >
                <label style={{ fontSize: "12px", fontWeight: "bold" }}>
                  Role Setup:
                </label>
                <select
                  disabled={isUpdatingRole}
                  value={user.role}
                  onChange={(e) => {
                    const newRole = e.target.value as
                      | "USER"
                      | "MODERATOR"
                      | "ADMIN"
                      | "SUPER_ADMIN";
                    if (
                      window.confirm(
                        `Are you sure you want to give the user this role: ${newRole}?`,
                      )
                    ) {
                      updateRole({ userId: user.id, newRole });
                    }
                  }}
                  style={{ padding: "5px" }}
                >
                  <option value="USER">USER</option>
                  <option value="MODERATOR">MODERATOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
        <button
          onClick={() => setSkip((p) => Math.max(0, p - take))}
          disabled={skip === 0}
          style={{ padding: "5px 10px" }}
        >
          Prev
        </button>
        <button
          onClick={() => setSkip((p) => p + take)}
          style={{ padding: "5px 10px" }}
        >
          Next
        </button>
      </div>
    </div>
  );
}
