import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/axios";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";


/* -------------------------------- */
const LEVELS = ["Beginner", "Intermediate", "Advanced"];
/* -------------------------------- */

export default function CoachingBatches() {
  /* ================= STATE ================= */
  const ITEMS_PER_PAGE = 3;

  const [page, setPage] = useState(1);
  const [batches, setBatches] = useState([]);
  const [sports, setSports] = useState([]);

  const [drawer, setDrawer] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(batches.length / ITEMS_PER_PAGE);

  const paginatedBatches = batches.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  /* ================= RESET PAGE ON DATA CHANGE ================= */
  useEffect(() => {
    setPage(1);
  }, [batches]);

  function DatePicker({ value, onChange, disabled }) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-start text-left font-normal h-10"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(new Date(value), "PPP") : "Pick a date"}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0 z-[9999]" align="start">
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) =>
              onChange(date ? format(date, "yyyy-MM-dd") : "")
            }
            initialFocus
            classNames={{
              day: "h-9 w-9 p-0 font-normal rounded-md transition-colors hover:bg-green-100 hover:text-green-900",
              day_selected:
                "bg-green-600 text-white hover:bg-green-600 hover:text-white",
              day_today:
                "border border-green-600 text-green-700 font-semibold",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled: "text-muted-foreground opacity-30",
            }}
          />
        </PopoverContent>
      </Popover>
    );
  }

  const { toast } = useToast(); // ✅ INIT
  const navigate = useNavigate();

  
  /* ================= FETCH ================= */
  const fetchAll = async () => {
    try {
      const [bRes, sRes] = await Promise.all([
        api.get("/batches"),
        api.get("/sports"),
      ]);

      setBatches(bRes.data || []);
      setSports(sRes.data || []);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to load data",
        description: err.response?.data?.message || "Server error",
      });
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ================= SPORT CARDS ================= */
  const sportStats = useMemo(() => {
    const map = {};
    batches.forEach((b) => {
      const key = b.sportName || "-";
      if (!map[key]) map[key] = { batches: 0, enrolled: 0 };
      map[key].batches += 1;
      map[key].enrolled += b.enrolledCount || 0;
    });
    return map;
  }, [batches]);

  /* ================= ACTIONS ================= */
  const openAdd = () => {
    setForm({});
    setSelected(null);
    setDrawer("add");
  };

  const openView = (b) => {
    setSelected(b);
    setForm(b);
    setDrawer("view");
  };

  const openEdit = (b) => {
    setSelected(b);
    setForm(b);
    setDrawer("edit");
  };

  const saveBatch = async () => {
    try {
      if (drawer === "add") {
        await api.post("/batches", form);
        toast({
          title: "Batch added",
          description: "New coaching batch created successfully",
        });
      } else {
        await api.put(`/batches/${selected._id}`, form);
        toast({
          title: "Batch updated",
          description: "Batch details updated successfully",
        });
      }

      setDrawer(null);
      fetchAll();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Action failed",
        description: err.response?.data?.message || "Server error",
      });
    }
  };

  const deleteBatch = async (id) => {
    if (!confirm("Delete this batch?")) return;

    try {
      await api.delete(`/batches/${id}`);
      toast({
        title: "Batch deleted",
        description: "Batch removed successfully",
      });
      fetchAll();
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: err.response?.data?.message || "Server error",
      });
    }
  };

 

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-green-800">
            Coaching Batches
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage coaching batches, schedules, and coach assignments.
          </p>
        </div>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(0)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            Refresh
          </Button>
          <Button className="bg-orange-500 mt-2" onClick={openAdd} >
            + Add New Batch
          </Button>
        </div>
      </div>

      {/* SPORT SUMMARY CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.entries(sportStats).map(([sport, s]) => (
          <div key={sport} className="bg-white border rounded-xl p-4">
            <div className="text-xl font-bold text-green-700">
              {s.batches}
            </div>
            <div className="font-medium">{sport}</div>
            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
              <Users className="w-4 h-4" />
              {s.enrolled} enrolled
            </div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border overflow-x-auto">

        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 text-left">
            <tr className="text-gray-700">
              <th className="px-4 py-3 w-[220px]">Batch Name</th>
              <th className="px-4 py-3 w-[120px]">Sport</th>
              <th className="px-4 py-3 w-[110px]">Level</th>
              <th className="px-4 py-3 w-[160px]">Coach</th>
              <th className="px-4 py-3 w-[260px]">Schedule</th>
              <th className="px-4 py-3 w-[120px]">Start Date</th>
              <th className="px-4 py-3 w-[160px]">Enrollment</th>
              <th className="px-4 py-3 w-[120px]">Monthly Fee</th>
              <th className="px-4 py-3 w-[100px]">Status</th>
              <th className="px-4 py-3 w-[60px] text-center">Action</th>
            </tr>
          </thead>


          <tbody>

            {paginatedBatches.map((b) => {
              const percent = Math.min(
                100,
                Math.round((b.enrolledCount / b.capacity) * 100)
              );

              return (
                <tr
                  key={b._id}
                  className="border-t hover:bg-gray-50 align-middle"
                >
                  {/* Batch Name */}
                  <td className="px-4 py-4 font-medium leading-snug">
                    {b.name}
                  </td>

                  {/* Sport */}
                  <td className="px-4 py-4 text-gray-700">
                    {b.sportName || "—"}
                  </td>

                  {/* Level */}
                  <td className="px-4 py-4">
                    <Badge variant="outline" className="capitalize">
                      {b.level}
                    </Badge>
                  </td>

                  {/* Coach */}
                  <td className="px-4 py-4 leading-snug">
                    {b.coachName}
                  </td>

                  {/* Schedule */}
                  <td className="px-4 py-4 leading-snug text-gray-700">
                    <div>{b.schedule}</div>
                    <div className="text-xs text-gray-500">
                      {b.time}
                    </div>
                  </td>

                  {/* Start Date */}
                  <td className="px-4 py-4 text-gray-700">
                    {b.startDate
                      ? new Date(b.startDate).toLocaleDateString("en-IN")
                      : "—"}
                  </td>

                  {/* Enrollment */}
                  <td className="px-4 py-4">
                    <div className="text-xs mb-1">
                      {b.enrolledCount}/{b.capacity}
                    </div>

                    <div className="h-2 w-full max-w-[120px] bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${percent >= 100
                          ? "bg-orange-500"
                          : "bg-green-600"
                          }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </td>

                  {/* Fee */}
                  <td className="px-4 py-4 font-medium">
                    ₹{b.monthlyFee}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <Badge className="bg-green-100 text-green-700 capitalize">
                      {b.status}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreHorizontal className="w-5 h-5 cursor-pointer text-gray-600" />
                      </DropdownMenuTrigger>

                      <DropdownMenuContent className="z-[9999] bg-white border shadow-lg align-end">
                        <DropdownMenuItem onClick={() => openView(b)} className="cursor-pointer">
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEdit(b)} className="cursor-pointer">
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 cursor-pointer"
                          onClick={() => deleteBatch(b._id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(page * ITEMS_PER_PAGE, batches.length)} of{" "}
            {batches.length}
          </p>


          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </Button>

            {[...Array(totalPages)].map((_, i) => (
              <Button
                key={i}
                size="sm"
                variant={page === i + 1 ? "default" : "outline"}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}

            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>


      {/* RIGHT DRAWER (40%) */}
      {/* RIGHT DRAWER (40%) */}
      <Sheet open={!!drawer} onOpenChange={() => setDrawer(null)}>
        <SheetContent side="right" className="w-[40vw]">
          <SheetHeader>
            <SheetTitle>
              {drawer === "add"
                ? "Add Coaching Batch"
                : drawer === "edit"
                  ? "Edit Coaching Batch"
                  : "View Coaching Batch"}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            {/* Batch Name */}
            <Input
              placeholder="Batch Name"
              disabled={drawer === "view"}
              value={form.name || ""}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            {/* Sport + Level */}
            <div className="grid grid-cols-2 gap-3">
              <Select
                disabled={drawer === "view"}
                value={form.sportName || ""}
                onValueChange={(v) =>
                  setForm({ ...form, sportName: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sport" />
                </SelectTrigger>
                <SelectContent>
                  {sports.map((s) => (
                    <SelectItem key={s._id} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                disabled={drawer === "view"}
                value={form.level || ""}
                onValueChange={(v) =>
                  setForm({ ...form, level: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l} value={l}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Coach */}
            <Input
              disabled={drawer === "view"}
              placeholder="Coach Name"
              value={form.coachName || ""}
              onChange={(e) =>
                setForm({ ...form, coachName: e.target.value })
              }
            />

            {/* Schedule */}
            <Input
              disabled={drawer === "view"}
              placeholder="Schedule"
              value={form.schedule || ""}
              onChange={(e) =>
                setForm({ ...form, schedule: e.target.value })
              }
            />

            {/* Time */}
            <Input
              disabled={drawer === "view"}
              placeholder="Time"
              value={form.time || ""}
              onChange={(e) =>
                setForm({ ...form, time: e.target.value })
              }
            />

            {/* Start Date + End Date */}
            <div className="grid grid-cols-2 gap-3">
              <DatePicker
                disabled={drawer === "view"}
                value={form.startDate}
                onChange={(date) =>
                  setForm({ ...form, startDate: date })
                }
              />

              <DatePicker
                disabled={drawer === "view"}
                value={form.endDate}
                onChange={(date) =>
                  setForm({ ...form, endDate: date })
                }
              />
            </div>

            {/* Capacity + Fee */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                disabled={drawer === "view"}
                type="number"
                placeholder="Capacity"
                value={form.capacity || ""}
                onChange={(e) =>
                  setForm({ ...form, capacity: e.target.value })
                }
              />

              <Input
                disabled={drawer === "view"}
                type="number"
                placeholder="Monthly Fee (₹)"
                value={form.monthlyFee || ""}
                onChange={(e) =>
                  setForm({ ...form, monthlyFee: e.target.value })
                }
              />
            </div>

            {/* Buttons */}
            {drawer !== "view" && (
              <div className="flex gap-3 pt-4">
                <Button className="bg-green-700" onClick={saveBatch}>
                  {drawer === "add" ? "Add Batch" : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setDrawer(null)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
}
