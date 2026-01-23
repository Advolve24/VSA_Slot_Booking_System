// src/pages/announcements/Announcements.jsx
import { useEffect, useState } from "react";
import api from "../../../lib/axios";
import { useAuth } from "../../providers/AuthProvider";
import { Link } from "react-router-dom";


export default function Announcements() {
  const { token } = useAuth();
  const [items, setItems] = useState([]);

  useEffect(() => {
    api
      .get("/announcements", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setItems(res.data));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-green-800">
          Announcements
        </h1>

        <Link
          to="/admin/announcements/add"
          className="px-4 py-2 bg-green-600 text-white rounded-md"
        >
          Add Announcement
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6 space-y-4">
        {items.map((a) => (
          <div
            key={a._id}
            className="border rounded-lg p-4 bg-gray-50"
          >
            <h3 className="font-semibold">{a.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{a.message}</p>
          </div>
        ))}

        {!items.length && (
          <p className="text-center text-gray-500 py-6">
            No announcements
          </p>
        )}
      </div>
    </div>
  );
}
