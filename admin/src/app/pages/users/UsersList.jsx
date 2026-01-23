// src/pages/users/UsersList.jsx
import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { useAuth } from "../../providers/AuthProvider";
export default function UsersList() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    api
      .get("/users", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setUsers(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-green-800">Users</h1>

      <div className="bg-white rounded-lg shadow p-6">
        <table className="w-full text-sm">
          <thead className="border-b text-gray-600">
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>

          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b">
                <td className="py-3">{u.fullName}</td>
                <td>{u.mobile}</td>
                <td>{u.email || "—"}</td>
                <td>
                  <span className="px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs">
                    {u.role}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!users.length && (
          <p className="text-center text-gray-500 py-6">
            No users found
          </p>
        )}
      </div>
    </div>
  );
}
