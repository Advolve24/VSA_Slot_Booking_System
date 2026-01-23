import { useEffect, useState } from "react";
import { Plus, MoreVertical, X } from "lucide-react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import api from "@/lib/axios";
import { toast } from "sonner";

const today = new Date().toISOString().split("T")[0];

export default function BlockedSlot() {
  /* ================= STATE ================= */
  const [facilities, setFacilities] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [drawer, setDrawer] = useState(null); // add | edit
  const [menuOpen, setMenuOpen] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());


  const [form, setForm] = useState({
    facilityId: "",
    date: today,
    slots: [],
    reason: "coaching",
  });

  const [availableSlots, setAvailableSlots] = useState([]);

  /* ================= LOAD FACILITIES ================= */
  useEffect(() => {
    loadFacilities();
    loadTable();
  }, []);

  const loadFacilities = async () => {
    const res = await api.get("/facilities");
    setFacilities(res.data || []);
  };

  /* ================= LOAD TABLE (ALL FACILITIES) ================= */
  const loadTable = async () => {
    const res = await api.get("/turf-rentals/blocked-slots", {
      params: { view: "table" },
    });
    setTableData(res.data || []);
  };

  /* ================= LOAD AVAILABLE SLOTS ================= */
  const loadSlots = async (facilityId, date) => {
    if (!facilityId || !date) return;

    const res = await api.get(
      `/turf-rentals/facilities/${facilityId}/slots`,
      { params: { date } }
    );
    setAvailableSlots(res.data || []);
  };

  /* ================= SLOT TOGGLE ================= */
  const toggleSlot = (time) => {
    setForm((prev) => ({
      ...prev,
      slots: prev.slots.includes(time)
        ? prev.slots.filter((t) => t !== time)
        : [...prev.slots, time],
    }));
  };

  /* ================= SAVE (ADD / EDIT) ================= */
  const saveBlockedSlots = async () => {
    if (!form.facilityId || !form.date || !form.slots.length) {
      toast.error("Facility, date & slots are required");
      return;
    }

    await api.post("/turf-rentals/blocked-slots", form);
    toast.success("Blocked slots saved");

    setDrawer(null);
    setForm({ facilityId: "", date: today, slots: [], reason: "coaching" });
    loadTable();
  };

  /* ================= DELETE SLOT ================= */
  const deleteSlot = async (id) => {
    await api.delete(`/turf-rentals/blocked-slots/${id}`);
    toast.success("Slot unblocked");
    loadTable();
  };

  /* ================= DRAWER ================= */
  const Drawer = ({ title, children }) => (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-end">
      <div className="w-[420px] bg-white h-full shadow-xl flex flex-col">
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="font-semibold text-lg">{title}</h2>
          <X className="cursor-pointer" onClick={() => setDrawer(null)} />
        </div>
        <div className="p-5 flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );

  const formatTime12H = (time) => {
    const [h] = time.split(":").map(Number);
    const hour12 = h % 12 || 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${hour12}:00 ${ampm}`;
  };

  const isMorning = (time) => {
    const h = Number(time.split(":")[0]);
    return h >= 7 && h < 12;
  };


  /* ================= UI ================= */
  return (
    <div className="p-6 text-sm">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Blocked Slots</h2>

        <button
          onClick={() => {
            setForm({ facilityId: "", date: today, slots: [], reason: "coaching" });
            setAvailableSlots([]);
            setDrawer("add");
          }}
          className="bg-green-600 text-white px-4 py-2 rounded flex gap-2"
        >
          <Plus size={18} /> Block Slot
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3 text-left">Facility</th>
              <th>Date</th>
              <th>Blocked Slots</th>
              <th className="text-left pr-4">Action</th>
            </tr>
          </thead>

          <tbody>
            {tableData.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center py-10 text-gray-500">
                  No blocked slots found
                </td>
              </tr>
            )}

            {tableData.map((row, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-3 font-medium">{row.facility?.name}</td>
                <td>{row.date}</td>

                <td>
                  <div className="flex flex-wrap gap-2">
                    {row.slots.map((s) => (
                      <span
                        key={s._id}
                        className="inline-flex items-center px-3 py-1 rounded-full
                   bg-red-100 text-red-700 text-xs font-medium"
                      >
                        {formatTime12H(s.startTime)}
                      </span>
                    ))}
                  </div>
                </td>


                <td className="text-right pr-4 relative">
                  <MoreVertical
                    className="cursor-pointer"
                    onClick={() => setMenuOpen(menuOpen === idx ? null : idx)}
                  />

                  {menuOpen === idx && (
                    <div className="absolute right-0 mt-2 bg-white border rounded shadow z-50 w-40 ">
                      <button
                        className="block w-full text-left px-4 py-2 hover:bg-gray-50"
                        onClick={() => {
                          setForm({
                            facilityId: row.facility?._id,
                            date: row.date,
                            slots: row.slots.map((s) => s.startTime),
                            reason: row.slots[0]?.reason || "coaching",
                          });
                          loadSlots(row.facility?._id, row.date);
                          setDrawer("edit");
                          setMenuOpen(null);
                        }}
                      >
                        Edit
                      </button>

                      {row.slots.map((s) => (
                        <button
                          key={s._id}
                          className="block w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
                          onClick={() => deleteSlot(s._id)}
                        >
                          Delete {s.startTime}
                        </button>
                      ))}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD / EDIT DRAWER */}
      {(drawer === "add" || drawer === "edit") && (
        <Drawer title={drawer === "add" ? "Block Slot" : "Edit Blocked Slot"}>
          {/* FACILITY */}
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium">Facility</label>

            <Select
              value={form.facilityId}
              onValueChange={(id) => {
                setForm({ ...form, facilityId: id, slots: [] });
                loadSlots(id, format(selectedDate, "yyyy-MM-dd"));
              }}
            >
              <SelectTrigger
                className="
                            w-full
                            transition-colors
                            hover:border-green-500
                            focus:border-green-600
                            focus:ring-1 focus:ring-green-600
                            data-[state=open]:border-green-600
                          "
              >
                <SelectValue placeholder="Select Facility" />
              </SelectTrigger>


              <SelectContent className="rounded-lg z-[9999] bg-white border shadow-lg">
                {facilities.map((f) => (
                  <SelectItem
                    value={f._id}
                    className="
                            cursor-pointer
                            focus:bg-green-600 focus:text-white
                            data-[state=checked]:bg-green-600
                            data-[state=checked]:text-white mb-1
                          "
                  >
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 mb-4">
            <label className="text-sm font-medium">Date</label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="
                      w-full justify-start text-left font-normal
                      hover:border-green-500
                      focus:ring-1 focus:ring-green-600
                      data-[state=open]:border-green-600 rounded-md
                    "
                >

                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate
                    ? format(selectedDate, "dd MMM yyyy")
                    : "Pick a date"}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    const apiDate = format(date, "yyyy-MM-dd");
                    setForm({ ...form, date: apiDate, slots: [] });
                    loadSlots(form.facilityId, apiDate);
                  }}
                  className="
                      [&_.rdp-day:hover]:bg-green-100
                      [&_.rdp-day_selected]:bg-green-600
                      [&_.rdp-day_selected]:text-white
                      [&_.rdp-day_selected:hover]:bg-green-700
                    "
                  initialFocus
                />

              </PopoverContent>
            </Popover>
          </div>

          {/* SLOTS */}
          {/* AVAILABLE SLOTS */}
          <div className="border rounded-2xl p-6 mt-4 bg-white">
            <h3 className="text-green-700 font-semibold mb-4">Available Slots</h3>

            <div className="grid grid-cols-2 gap-8">
              {/* MORNING */}
              <div>
                <p className="text-gray-600 mb-4">
                  Morning <span className="text-sm">(7 AM – 11 AM)</span>
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {availableSlots
                    .filter((s) => isMorning(s.time))
                    .map((slot) => (
                      <button
                        key={slot.time}
                        disabled={slot.status !== "available"}
                        onClick={() => toggleSlot(slot.time)}
                        className={`h-16 rounded-xl border text-sm font-medium
                ${slot.status === "available"
                            ? form.slots.includes(slot.time)
                              ? "bg-red-100 border-red-500 text-red-700"
                              : "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                            : slot.status === "booked"
                              ? "bg-orange-100 border-orange-400 text-orange-700 cursor-not-allowed"
                              : "bg-red-100 border-red-400 text-red-700 cursor-not-allowed"
                          }`}
                      >
                        <div>{formatTime12H(slot.time).split(" ")[0]}</div>
                        <div className="text-xs">{formatTime12H(slot.time).split(" ")[1]}</div>
                      </button>
                    ))}
                </div>
              </div>

              {/* EVENING */}
              <div>
                <p className="text-gray-600 mb-4">
                  Evening <span className="text-sm">(2 PM – 9 PM)</span>
                </p>

                <div className="grid grid-cols-2 gap-4">
                  {availableSlots
                    .filter((s) => !isMorning(s.time))
                    .map((slot) => (
                      <button
                        key={slot.time}
                        disabled={slot.status !== "available"}
                        onClick={() => toggleSlot(slot.time)}
                        className={`h-16 rounded-xl border text-sm font-medium
                ${slot.status === "available"
                            ? form.slots.includes(slot.time)
                              ? "bg-red-100 border-red-500 text-red-700"
                              : "bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
                            : slot.status === "booked"
                              ? "bg-orange-100 border-orange-400 text-orange-700 cursor-not-allowed"
                              : "bg-red-100 border-red-400 text-red-700 cursor-not-allowed"
                          }`}
                      >
                        <div>{formatTime12H(slot.time).split(" ")[0]}</div>
                        <div className="text-xs">{formatTime12H(slot.time).split(" ")[1]}</div>
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* LEGEND */}
            <div className="flex gap-6 mt-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                Available
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                Booked
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                Blocked
              </div>
            </div>
          </div>


          {/* REASON */}
          <div className="space-y-2 mt-4">
            <label className="text-sm font-medium">Reason</label>

            <Select
              value={form.reason}
              onValueChange={(value) =>
                setForm({ ...form, reason: value })
              }
            >
              <SelectTrigger
                className="
                          w-full
                          hover:border-green-500
                          focus:ring-1 focus:ring-green-600
                          data-[state=open]:border-green-600
                        "
              >
                <SelectValue placeholder="Select Reason" />
              </SelectTrigger>


              <SelectContent>
                <SelectItem
                              value="coaching"
                              className="
                                focus:bg-green-600 focus:text-white
                                data-[state=checked]:bg-green-600
                                data-[state=checked]:text-white
                              "
                            >
                              Coaching
                            </SelectItem>
                  <SelectItem
                              value="maintenance"
                              className="
                                focus:bg-green-600 focus:text-white
                                data-[state=checked]:bg-green-600
                                data-[state=checked]:text-white
                              "
                            >
                              Maintenance
                            </SelectItem>
                  <SelectItem
                              value="event"
                              className="
                                focus:bg-green-600 focus:text-white
                                data-[state=checked]:bg-green-600
                                data-[state=checked]:text-white
                              "
                            >
                              event
                            </SelectItem>
              </SelectContent>
            </Select>
          </div>


          <button
            onClick={saveBlockedSlots}
            className="mt-6 bg-green-600 text-white w-full py-3 rounded"
          >
            Save
          </button>
        </Drawer>
      )}
    </div>
  );
}
