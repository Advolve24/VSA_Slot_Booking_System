// src/pages/announcements/AddAnnouncement.jsx
import { useState } from "react";
import api from "../../../lib/axios";
import { useAuth } from "../../providers/AuthProvider";
import { useNavigate } from "react-router-dom";


export default function AddAnnouncement() {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();

    await api.post(
      "/announcements",
      { title, message },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    navigate("/admin/announcements");
  };

  return (
    <div className="max-w-xl bg-white shadow p-6 rounded-lg">
      <h2 className="text-lg font-semibold text-green-700 mb-4">
        New Announcement
      </h2>

      <form className="space-y-4" onSubmit={submit}>
        <input
          className="w-full border p-2 rounded"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full border p-2 rounded"
          placeholder="Message"
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button className="px-4 py-2 bg-green-700 text-white rounded-md">
          Publish
        </button>
      </form>
    </div>
  );
}
