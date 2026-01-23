// src/pages/booking/AllBookings.jsx
import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { useAuth } from "../../providers/AuthProvider";

export default function AllBookings() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    api
      .get("/bookings", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setBookings(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-green-800">All Bookings</h1>

      <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b text-gray-600">
            <tr>
              <th>User</th>
              <th>Sport</th>
              <th>Facility</th>
              <th>Date</th>
              <th>Slot</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {bookings.map((b) => (
              <tr key={b._id} className="border-b">
                <td className="py-3">{b.user?.fullName}</td>
                <td>{b.sport?.name}</td>
                <td>{b.facility?.name}</td>
                <td>{new Date(b.date).toLocaleDateString()}</td>
                <td>{b.slot}</td>
                <td>
                  <span className="px-2 py-1 rounded bg-green-100 text-green-700 text-xs">
                    {b.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!bookings.length && (
          <p className="text-center text-gray-500 py-6">
            No bookings found
          </p>
        )}
      </div>
    </div>
  );
}
