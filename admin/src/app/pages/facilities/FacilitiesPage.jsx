import { useState } from "react";
import FacilityList from "./FacilityList";
import BlockedSlots from "./BlockedSlots";

export default function FacilitiesPage() {
  const [activeTab, setActiveTab] = useState("facilities");

  const tabClass = (tab) =>
    `px-5 py-2 rounded-md text-sm font-medium transition-all ${
      activeTab === tab
        ? "bg-green-700 text-white shadow"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <div className="p-0">
      {/* Page Header */}
      <div className="mb-3">
        <h1 className="text-2xl font-bold text-green-800">
          Facility Management
        </h1>
        <p className="text-gray-500">
          Manage academy facilities, availability and blocked slots.
        </p>
      </div>

      {/* Tabs */}
      <div className="inline-flex gap-2 bg-gray-100 p-2 rounded-lg mb-2">
        <button
          className={tabClass("facilities")}
          onClick={() => setActiveTab("facilities")}
        >
          Facilities
        </button>

        <button
          className={tabClass("blocked")}
          onClick={() => setActiveTab("blocked")}
        >
          Blocked Slots
        </button>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "facilities" && <FacilityList />}
        {activeTab === "blocked" && <BlockedSlots />}
      </div>
    </div>
  );
}
