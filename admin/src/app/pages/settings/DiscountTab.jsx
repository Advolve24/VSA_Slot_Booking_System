import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil, MoreHorizontal } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

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

export default function DiscountTab() {
  const { toast } = useToast();
  const [discounts, setDiscounts] = useState([]);
  const [sports, setSports] = useState([]);
  const [batches, setBatches] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const initialForm = {
    title: "",
    code: "",
    type: "percentage",
    value: "",
    applicableFor: "enrollment",
    sportId: "",
    batchId: "",
    validFrom: "",
    validTill: "",
  };

  const [form, setForm] = useState(initialForm);

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchDiscounts();
    fetchSports();
    fetchBatches();
  }, []);

  const fetchDiscounts = async () => {
    const res = await api.get("/discounts");
    setDiscounts(res.data || []);
  };

  const fetchSports = async () => {
    const res = await api.get("/sports");
    setSports(res.data || []);
  };

  const fetchBatches = async () => {
    const res = await api.get("/batches");
    setBatches(res.data || []);
  };

  const filteredBatches = form.sportId
    ? batches.filter((b) => String(b.sportId) === String(form.sportId))
    : batches;

  /* ================= SAVE ================= */
  const handleSubmit = async () => {
    try {
      const payload = {
        ...form,
        value: Number(form.value),
      };

      if (editingId) {
        await api.put(`/discounts/${editingId}`, payload);
        toast({ title: "Discount Updated ✅" });
      } else {
        await api.post("/discounts", payload);
        toast({ title: "Discount Created ✅" });
      }

      setForm(initialForm);
      setEditingId(null);
      fetchDiscounts();
    } catch (err) {
      toast({
        variant: "destructive",
        title: err?.response?.data?.message || "Operation failed",
      });
    }
  };

  const handleEdit = (d) => {
    setEditingId(d._id);
    setForm({
      ...d,
      sportId: d.sportId?._id || d.sportId || "",
      batchId: d.batchId?._id || d.batchId || "",
      validFrom: d.validFrom?.slice(0, 10) || "",
      validTill: d.validTill?.slice(0, 10) || "",
    });
  };

  const handleDelete = async (id) => {
    await api.delete(`/discounts/${id}`);
    toast({ title: "Discount Deleted" });
    fetchDiscounts();
  };

  const toggleActive = async (discount) => {
    await api.put(`/discounts/${discount._id}`, {
      isActive: !discount.isActive,
    });
    fetchDiscounts();
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

  function DatePicker({ value, onChange, disabled }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-start text-left font-normal h-10 bg-white border border-gray-300"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(new Date(value), "dd MMM yyyy") : "Pick a date"}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          side="bottom"
          sideOffset={8}
          className="w-auto p-0 z-[9999] bg-white border shadow-lg"
        >
          <Calendar
            mode="single"
            selected={value ? new Date(value) : undefined}
            onSelect={(date) => {
              if (!date) return;
              const d = new Date(date);
              d.setHours(0, 0, 0, 0);
              onChange(format(d, "yyyy-MM-dd"));
            }}
            disabled={(date) => {
              const d = new Date(date);
              d.setHours(0, 0, 0, 0);
              return d < today; // disable past dates
            }}
            initialFocus
            classNames={{
              day: "h-9 w-9 rounded-md hover:bg-green-100 hover:text-green-900 transition",
              day_selected:
                "bg-green-600 text-white hover:bg-green-600 hover:text-white",
              day_today:
                "border border-green-600 text-green-700 font-semibold",
              day_outside: "text-muted-foreground opacity-50",
              day_disabled:
                "text-muted-foreground opacity-30 cursor-not-allowed",
            }}
          />
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <div className="bg-white border rounded-2xl shadow-sm p-4 md:p-6 space-y-6">

      {/* HEADER */}
      <h2 className="text-lg font-semibold">
        {editingId ? "Edit Discount" : "Create Discount"}
      </h2>

      {/* FORM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">

        <div>
          <Label>Discount Title *</Label>
          <Input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Discount Code</Label>
          <Input
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
          />
        </div>

        {/* TYPE */}
        <div>
          <Label>Discount Type</Label>
          <Select
            value={form.type}
            onValueChange={(v) =>
              setForm({ ...form, type: v })
            }
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[9999] bg-white border shadow-lg">
              <SelectItem value="percentage" className={selectItemClass}>
                Percentage (%)
              </SelectItem>
              <SelectItem value="flat" className={selectItemClass}>
                Flat (₹)
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Value</Label>
          <Input
            type="number"
            value={form.value}
            onChange={(e) =>
              setForm({ ...form, value: e.target.value })
            }
          />
        </div>

        {/* APPLICABLE */}
        <div>
          <Label>Applicable For</Label>
          <Select
            value={form.applicableFor}
            onValueChange={(v) =>
              setForm({ ...form, applicableFor: v })
            }
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="z-[9999] bg-white border shadow-lg">
              <SelectItem value="enrollment" className={selectItemClass}>
                Enrollment
              </SelectItem>
              <SelectItem value="turf" className={selectItemClass}>
                Turf
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* SPORT */}
        <div>
          <Label>Sport</Label>
          <Select
            value={form.sportId || "all"}
            onValueChange={(v) =>
              setForm({
                ...form,
                sportId: v === "all" ? "" : v,
                batchId: "",
              })
            }
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>
            <SelectContent className="z-[9999] bg-white border shadow-lg">
              <SelectItem value="all" className={selectItemClass}>
                All Sports
              </SelectItem>
              {sports.map((s) => (
                <SelectItem
                  key={s._id}
                  value={s._id}
                  className={selectItemClass}
                >
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* BATCH */}
        <div>
          <Label>Batch</Label>
          <Select
            value={form.batchId || "all"}
            onValueChange={(v) =>
              setForm({
                ...form,
                batchId: v === "all" ? "" : v,
              })
            }
          >
            <SelectTrigger className={selectTriggerClass}>
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>
            <SelectContent className="z-[9999] bg-white border shadow-lg">
              <SelectItem value="all" className={selectItemClass}>
                All Batches
              </SelectItem>
              {filteredBatches.map((b) => (
                <SelectItem
                  key={b._id}
                  value={b._id}
                  className={selectItemClass}
                >
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Valid From</Label>
          <DatePicker
            value={form.validFrom}
            onChange={(date) =>
              setForm({ ...form, validFrom: date })
            }
          />

        </div>

        <div>
          <Label>Valid Till</Label>
          <DatePicker
            value={form.validTill}
            onChange={(date) =>
              setForm({ ...form, validTill: date })
            }
          />

        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex flex-col md:flex-row gap-3">
        <Button
          onClick={handleSubmit}
          className="bg-green-700 w-full md:w-auto"
        >
          {editingId ? "Update Discount" : "Create Discount"}
        </Button>

        {editingId && (
          <Button
            variant="outline"
            onClick={() => {
              setEditingId(null);
              setForm(initialForm);
            }}
            className="w-full md:w-auto"
          >
            Cancel
          </Button>
        )}
      </div>

      {/* LIST */}
      <div>
        <h3 className="font-semibold mb-4">
          Existing Discounts
        </h3>

        <div className="space-y-2">
          {discounts.map((d) => (
            <div
              key={d._id}
              className="flex justify-between items-center border p-3 rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {d.title}{" "}
                  {d.type === "percentage"
                    ? `${d.value}%`
                    : `₹${d.value}`}
                </p>
                <p className="text-sm text-gray-500">
                  {d.code && `Code: ${d.code} | `}
                  {d.isActive ? "Active" : "Inactive"}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 hover:bg-gray-100 rounded">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="z-[9999] bg-white border shadow-lg">
                  <DropdownMenuItem onClick={() => handleEdit(d)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => toggleActive(d)}
                  >
                    {d.isActive ? "Disable" : "Enable"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => handleDelete(d._id)}
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
