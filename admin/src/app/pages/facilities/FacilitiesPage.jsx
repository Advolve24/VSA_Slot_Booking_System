import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import FacilityList from "./FacilityList";
import BlockedSlots from "./BlockedSlots";
import SlotAllocation from "./SlotAllocation";

export default function FacilitiesPage() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("facilities");

   useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state]);

  const tabClass = (tab) =>
    `px-5 py-2 rounded-md text-sm font-medium transition-all ${
      activeTab === tab
        ? "bg-green-700 text-white shadow"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`;

  return (
    <div className="p-0">
      <div className="mb-2">
          <h1 className="text-2xl font-bold text-green-800">
            Facility Management
          </h1>
          <p className="text-muted-foreground">
            Manage Facility, Slot allocation and Blocking slots.
          </p>
        </div>

      {/* Tabs */}
      <div className="inline-flex gap-2 bg-gray-100 p-2 rounded-lg mb-3">
        <button
          className={tabClass("facilities")}
          onClick={() => setActiveTab("facilities")}
        >
          Facilities
        </button>

        <button
          className={tabClass("slots")}
          onClick={() => setActiveTab("slots")}
        >
          Slot Allocation
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
        {activeTab === "slots" && <SlotAllocation />}
        {activeTab === "blocked" && <BlockedSlots />}
      </div>
    </div>
  );
}
