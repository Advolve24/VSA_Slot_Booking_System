import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { format } from "date-fns";
import {
  Plus,
  Pencil,
  MoreVertical,
  CalendarIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useToast } from "@/hooks/use-toast";

/* ================= UTILS ================= */
const toDateOnly = (d) => format(new Date(d), "yyyy-MM-dd");

const formatTime12H = (time) => {
  const h = Number(time.split(":")[0]);
  return `${h % 12 || 12}:00 ${h < 12 ? "AM" : "PM"}`;
};

const selectTriggerClass =
  "w-full h-10 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600";

const selectItemClass = `
  cursor-pointer
  transition-colors
  data-[highlighted]:bg-green-100
  data-[highlighted]:text-green-900
  data-[state=checked]:bg-green-600
  data-[state=checked]:text-white
`;

export default function BlockedSlot() {
  const { toast } = useToast();

  /* ================= STATE ================= */
  const [facilities, setFacilities] = useState([]);
  const [tableData, setTableData] = useState([]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);

  const [form, setForm] = useState({
    facilityId: "",
    date: toDateOnly(new Date()),
    slots: [],
    reason: "coaching",
  });

  /* ================= LOAD ================= */
  useEffect(() => {
    loadFacilities();
    loadTable();
  }, []);

  const loadFacilities = async () => {
    const res = await api.get("/facilities");
    setFacilities(res.data || []);
  };

  const loadTable = async () => {
    const res = await api.get("/turf-rentals/blocked-slots");
    setTableData(res.data || []);
  };

  const loadSlots = async (facilityId, date) => {
    if (!facilityId || !date) return;
    const res = await api.get(
      `/turf-rentals/facilities/${facilityId}/slots`,
      { params: { date } }
    );
    setAvailableSlots(res.data || []);
  };

  /* ================= GROUP SLOTS ================= */
  const groupedSlots = useMemo(() => {
    const morning = availableSlots.filter(
      (s) => Number(s.time.split(":")[0]) < 12
    );
    const evening = availableSlots.filter(
      (s) => Number(s.time.split(":")[0]) >= 12
    );
    return { morning, evening };
  }, [availableSlots]);

  /* ================= ACTIONS ================= */
  const openAdd = () => {
    const d = new Date();
    setEditingId(null);
    setSelectedDate(d);
    setAvailableSlots([]);
    setForm({
      facilityId: "",
      date: toDateOnly(d),
      slots: [],
      reason: "coaching",
    });
    setDrawerOpen(true);
  };

  const openEdit = async (row) => {
    setEditingId(row._id);
    setSelectedDate(new Date(row.date));
    setForm({
      facilityId: row.facilityId._id,
      date: row.date,
      slots: [],
      reason: row.slots?.[0]?.reason || "coaching",
    });
    await loadSlots(row.facilityId._id, row.date);
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setAvailableSlots([]);
    setForm({
      facilityId: "",
      date: toDateOnly(new Date()),
      slots: [],
      reason: "coaching",
    });
  };

  const toggleSlot = (time) => {
    setForm((f) => ({
      ...f,
      slots: f.slots.includes(time)
        ? f.slots.filter((t) => t !== time)
        : [...f.slots, time],
    }));
  };

  /* ================= SAVE ================= */
  const saveBlockedSlots = async () => {
    // ❌ Only enforce slot selection in ADD mode
    if (!editingId && !form.slots.length) {
      toast({
        title: "Select slots",
        description: "Select at least one available slot",
        variant: "destructive",
      });
      return;
    }

    try {
      // 🟢 Only call POST if there are new slots to block
      if (form.slots.length > 0) {
        await api.post("/turf-rentals/blocked-slots", {
          facilityId: form.facilityId,
          date: form.date,
          slots: form.slots,
          reason: form.reason,
        });
      }

      toast({
        title: "Saved",
        description: "Blocked slots updated successfully",
      });

      await loadTable();
      closeDrawer();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to save slots",
        variant: "destructive",
      });
    }
  };


  /* ================= UNBLOCK SINGLE SLOT ================= */
  const unblockSlot = async (time) => {
    try {
      await api.delete(
        `/turf-rentals/blocked-slots/${editingId}/${encodeURIComponent(time)}`
      );

      toast({
        title: "Slot unblocked",
        description: "Slot removed successfully",
      });

      await loadTable();
      await loadSlots(form.facilityId, form.date);
    } catch {
      toast({
        title: "Error",
        description: "Failed to unblock slot",
        variant: "destructive",
      });
    }
  };

  /* ================= DELETE FULL ROW ================= */
  const deleteRow = async (id) => {
    if (!window.confirm("Delete all blocked slots for this date?")) return;

    try {
      await api.delete(`/turf-rentals/blocked-slots/${id}`);

      toast({
        title: "Deleted",
        description: "Blocked entry removed",
      });

      await loadTable();
      closeDrawer();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete entry",
        variant: "destructive",
      });
    }
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-green-800">Blocked Slots</h1>
        <Button onClick={openAdd} className="bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Block Slot
        </Button>
      </div>

      {/* TABLE */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left w-[220px]">Facility</th>
              <th className="text-left">Blocked Slots</th>
              <th className="text-center w-[120px]">Date</th>
              <th className="text-center w-[70px]">Action</th>
            </tr>
          </thead>

          <tbody>
            {tableData.map((row) => (
              <tr key={row._id} className="border-t align-top">
                <td className="p-3 font-medium">
                  {row.facilityId?.name}
                </td>

                <td className="p-2">
                  <div className="flex flex-wrap gap-1">
                    {row.slots.map((s) => (
                      <span
                        key={s.startTime}
                        className="text-[11px] px-2 py-[2px] rounded-full border bg-red-50 text-red-700 border-red-300"
                      >
                        {formatTime12H(s.startTime)}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="text-center pt-3">
                  {format(new Date(row.date), "dd MMM yyyy")}
                </td>

                <td className="text-center pt-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 rounded hover:bg-gray-100">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-[9999] bg-white border shadow-lg align-end cursor-pointer" align="end">
                      <DropdownMenuItem onClick={() => openEdit(row)}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => deleteRow(row._id)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* DRAWER */}
      <Sheet open={drawerOpen} onOpenChange={closeDrawer}>
        <SheetContent side="right" className="w-[460px]">
          <SheetHeader>
            <SheetTitle>
              {editingId ? "Edit Blocked Slots" : "Block Slots"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            {/* FACILITY */}
            <Select
              disabled={!!editingId}
              value={form.facilityId}
              onValueChange={(v) => {
                setForm((f) => ({ ...f, facilityId: v, slots: [] }));
                loadSlots(v, form.date);
              }}
            >
              <SelectTrigger className={selectTriggerClass}>
                <SelectValue placeholder="Select facility" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                {facilities.map((f) => (
                  <SelectItem
                    key={f._id}
                    value={f._id}
                    className={selectItemClass}
                  >
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* DATE */}
            <Popover>
              <PopoverTrigger asChild disabled={!!editingId}>
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 bg-white border border-gray-300"
                  disabled={!!editingId}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "dd MMM yyyy")}
                </Button>
              </PopoverTrigger>

              <PopoverContent
                align="start"
                side="bottom"
                sideOffset={8}
                className="z-[10000] p-0 bg-white border shadow-lg"
              >
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    if (!d) return;
                    setSelectedDate(d);

                    const apiDate = toDateOnly(d);
                    setForm((f) => ({ ...f, date: apiDate, slots: [] }));

                    loadSlots(form.facilityId, apiDate);
                  }}
                  initialFocus
                  classNames={{
                    day: "h-9 w-9 rounded-md hover:bg-green-100",
                    day_selected:
                      "bg-green-600 text-white hover:bg-green-600",
                    day_today:
                      "border border-green-600 text-green-700 font-semibold",
                  }}
                />
              </PopoverContent>
            </Popover>

            {/* SLOTS */}
            {[groupedSlots.morning, groupedSlots.evening].map(
              (group, idx) => (
                <div key={idx} className="flex flex-wrap gap-2">
                  {group.map((slot) => {
                    const selected = form.slots.includes(slot.time);

                    const cls =
                      slot.status === "available"
                        ? selected
                          ? "bg-red-100 border-red-500 text-red-700"
                          : "bg-green-50 border-green-400 text-green-700 hover:bg-green-100 cursor-pointer"
                        : slot.status === "booked"
                          ? "bg-orange-100 border-orange-400 text-orange-700 cursor-not-allowed"
                          : "bg-red-100 border-red-400 text-red-700 cursor-pointer";

                    return (
                      <div
                        key={slot.time}
                        onClick={() =>
                          slot.status === "available"
                            ? toggleSlot(slot.time)
                            : editingId &&
                            slot.status === "blocked" &&
                            unblockSlot(slot.time)
                        }
                        className={`px-4 py-2 rounded-full border text-sm transition ${cls}`}
                      >
                        {formatTime12H(slot.time)}
                      </div>
                    );
                  })}
                </div>
              )
            )}

            <Button onClick={saveBlockedSlots} className="w-full bg-green-700">
              Save
            </Button>

            {editingId && (
              <p className="text-xs text-gray-500">
                Tip: Click a{" "}
                <span className="text-red-600 font-medium">blocked</span> slot
                to unblock it.
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
