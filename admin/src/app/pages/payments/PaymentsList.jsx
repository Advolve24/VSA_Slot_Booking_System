// src/pages/payments/PaymentsList.jsx
import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { useAuth } from "../../providers/AuthProvider";

export default function PaymentsList() {
  const { token } = useAuth();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    api
      .get("/payments", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setPayments(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-green-800">Payments</h1>

      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-gray-600">
            <tr>
              <th>User</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>

          <tbody>
            {payments.map((p) => (
              <tr key={p._id} className="border-b">
                <td className="py-3">{p.user?.fullName}</td>
                <td>₹{p.amount}</td>
                <td>{p.method}</td>
                <td>
                  <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                    {p.status}
                  </span>
                </td>
                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {!payments.length && (
          <p className="text-center text-gray-500 py-6">
            No payments found
          </p>
        )}
      </div>
    </div>
  );
}
