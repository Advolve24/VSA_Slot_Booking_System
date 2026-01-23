// src/components/EmptyState.jsx
import { Inbox } from "lucide-react";

export default function EmptyState({ title = "No Data Found", message = "" }) {
  return (
    <div className="text-center py-14 opacity-80">
      <Inbox className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-semibold text-gray-700">{title}</h3>
      {message && (
        <p className="text-gray-500 text-sm mt-1">{message}</p>
      )}
    </div>
  );
}
