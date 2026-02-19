import { useEffect, useMemo, useState } from "react";
import api from "@/lib/axios";
import { format } from "date-fns";
import {
  Plus,
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
const selectItemClass =
  "cursor-pointer transition-colors data-[highlighted]:bg-green-100 data-[highlighted]:text-green-900 data-[state=checked]:bg-green-600 data-[state=checked]:text-white";

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
  const [isMobile, setIsMobile] = useState(false);
  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

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

  /* ================= GROUP ================= */
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
    if (!editingId && !form.slots.length) {
      toast({
        title: "Select slots",
        description: "Select at least one available slot",
        variant: "destructive",
      });
      return;
    }

    try {
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

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center">
        <h1 className="text-md sm:text-xl font-semibold text-green-800">
          Blocked Slots
        </h1>
        <Button onClick={openAdd} className="bg-green-700">
          <Plus className="mr-2 h-4 w-4" />
          Block Slot
        </Button>
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3 text-left">Facility</th>
              <th>Blocked Slots</th>
              <th>Date</th>
              <th className="text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr key={row._id} className="border-t">
                <td className="p-3 font-medium">
                  {row.facilityId?.name}
                </td>

                <td>
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

                <td>{format(new Date(row.date), "dd MMM yyyy")}</td>

                <td className="text-right pr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="p-2 hover:bg-gray-100 rounded">
                        <MoreVertical size={16} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-[9999] bg-white border shadow-lg">
                      <DropdownMenuItem onClick={() => openEdit(row)}>
                        Edit
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= MOBILE CARD VIEW ================= */}
      <div className="md:hidden space-y-4">
        {tableData.map((row) => (
          <div
            key={row._id}
            className="bg-white border rounded-xl p-3 shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-base">
                  {row.facilityId?.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(row.date), "dd MMM yyyy")}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <MoreVertical size={16} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-[9999] bg-white border shadow-lg">
                  <DropdownMenuItem onClick={() => openEdit(row)}>
                    Edit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {row.slots.map((s) => (
                <span
                  key={s.startTime}
                  className="text-xs px-3 py-1 rounded-full border bg-red-50 text-red-700 border-red-300"
                >
                  {formatTime12H(s.startTime)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ================= DRAWER ================= */}
      <Sheet open={drawerOpen} onOpenChange={closeDrawer}>
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={
            isMobile
              ? "h-[70vh] rounded-t-2xl flex flex-col px-3 pt-4 pb-3"
              : "w-[460px] h-screen flex flex-col"
          }
        >
          <SheetHeader className="shrink-0">
            <SheetTitle>
              {editingId ? "Edit Blocked Slots" : "Block Slots"}
            </SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto mt-4 space-y-4 pr-1">
            {/* FACILITY */}
            <Select
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
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start h-10 bg-white border"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "dd MMM yyyy")}
                </Button>
              </PopoverTrigger>

              <PopoverContent className="z-[10000] p-0 bg-white border shadow-lg">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => {
                    if (!d) return;
                    setSelectedDate(d);
                    const apiDate = toDateOnly(d);
                    setForm((f) => ({ ...f, date: apiDate }));
                    loadSlots(form.facilityId, apiDate);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            {/* SLOT CHIPS */}
            {[groupedSlots.morning, groupedSlots.evening].map(
              (group, idx) => (
                <div key={idx} className="flex flex-wrap gap-2">
                  {group.map((slot) => {
                    const selected = form.slots.includes(slot.time);

                    return (
                      <div
                        key={slot.time}
                        onClick={() =>
                          slot.status === "available" &&
                          toggleSlot(slot.time)
                        }
                        className={`px-4 py-2 rounded-full border text-sm cursor-pointer transition ${
                          selected
                            ? "bg-red-100 border-red-500 text-red-700"
                            : "bg-green-50 border-green-400 text-green-700"
                        }`}
                      >
                        {formatTime12H(slot.time)}
                      </div>
                    );
                  })}
                </div>
              )
            )}
          </div>

          {/* FIXED FOOTER */}
          <div className="shrink-0 pt-3 border-t bg-white">
            <Button
              onClick={saveBlockedSlots}
              className="w-full bg-green-700"
            >
              Save
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
