import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Pencil } from "lucide-react";

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
    planType: "",
    sportId: "",
    batchId: "",
    minSlots: "",
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

  /* ================= FILTER BATCH BY SPORT ================= */
  const filteredBatches = form.sportId
  ? batches.filter(
      (b) =>
        String(b.sportId) === String(form.sportId)
    )
  : batches;


  /* ================= CREATE OR UPDATE ================= */
  const handleSubmit = async () => {
    try {
      const payload = {
        title: form.title,
        code: form.code || null,
        type: form.type,
        value: Number(form.value),
        applicableFor: form.applicableFor,
        planType:
          form.applicableFor === "enrollment"
            ? form.planType || null
            : null,
        sportId: form.sportId || null,
        batchId: form.batchId || null,
        minSlots:
          form.applicableFor === "turf"
            ? Number(form.minSlots) || 0
            : 0,
        validFrom: form.validFrom || null,
        validTill: form.validTill || null,
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
        title:
          err?.response?.data?.message ||
          "Operation failed",
      });
    }
  };

  /* ================= EDIT ================= */
  const handleEdit = (d) => {
  setEditingId(d._id);

  setForm({
    title: d.title || "",
    code: d.code || "",
    type: d.type,
    value: d.value,
    applicableFor: d.applicableFor,
    planType: d.planType || "",

    // 🔥 FIX HERE
    sportId: d.sportId?._id || d.sportId || "",
    batchId: d.batchId?._id || d.batchId || "",

    minSlots: d.minSlots || "",
    validFrom: d.validFrom
      ? d.validFrom.slice(0, 10)
      : "",
    validTill: d.validTill
      ? d.validTill.slice(0, 10)
      : "",
  });
};

  /* ================= DELETE ================= */
  const handleDelete = async (id) => {
    await api.delete(`/discounts/${id}`);
    toast({ title: "Discount Deleted" });
    fetchDiscounts();
  };

  /* ================= TOGGLE ACTIVE ================= */
  const toggleActive = async (discount) => {
    await api.put(`/discounts/${discount._id}`, {
      isActive: !discount.isActive,
    });

    fetchDiscounts();
  };

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-6">

      <h2 className="text-lg font-semibold">
        {editingId ? "Edit Discount" : "Create Discount"}
      </h2>

      <div className="grid md:grid-cols-2 gap-6">

        {/* TITLE */}
        <div className="space-y-2">
          <Label>Discount Title *</Label>
          <Input
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
        </div>

        {/* CODE */}
        <div className="space-y-2">
          <Label>Discount Code (Optional)</Label>
          <Input
            value={form.code}
            onChange={(e) =>
              setForm({ ...form, code: e.target.value.toUpperCase() })
            }
          />
        </div>

        {/* TYPE */}
        <div className="space-y-2">
          <Label>Discount Type *</Label>
          <select
            className="border rounded-md p-2 w-full"
            value={form.type}
            onChange={(e) =>
              setForm({ ...form, type: e.target.value })
            }
          >
            <option value="percentage">Percentage (%)</option>
            <option value="flat">Flat (₹)</option>
          </select>
        </div>

        {/* VALUE */}
        <div className="space-y-2">
          <Label>Value *</Label>
          <Input
            type="number"
            value={form.value}
            onChange={(e) =>
              setForm({ ...form, value: e.target.value })
            }
          />
        </div>

        {/* APPLICABLE */}
        <div className="space-y-2">
          <Label>Applicable For *</Label>
          <select
            className="border rounded-md p-2 w-full"
            value={form.applicableFor}
            onChange={(e) =>
              setForm({
                ...form,
                applicableFor: e.target.value,
              })
            }
          >
            <option value="enrollment">Enrollment</option>
            <option value="turf">Turf</option>
          </select>
        </div>

        {/* PLAN TYPE */}
        {form.applicableFor === "enrollment" && (
          <div className="space-y-2">
            <Label>Plan Type (Optional)</Label>
            <select
              className="border rounded-md p-2 w-full"
              value={form.planType}
              onChange={(e) =>
                setForm({ ...form, planType: e.target.value })
              }
            >
              <option value="">All Plans</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
        )}

        {/* SPORT */}
        <div className="space-y-2">
          <Label>Sport (Optional)</Label>
          <select
            className="border rounded-md p-2 w-full"
            value={form.sportId}
            onChange={(e) =>
              setForm({
                ...form,
                sportId: e.target.value,
                batchId: "",
              })
            }
          >
            <option value="">All Sports</option>
            {sports.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* BATCH */}
        <div className="space-y-2">
          <Label>Batch (Optional)</Label>
          <select
            className="border rounded-md p-2 w-full"
            value={form.batchId}
            onChange={(e) =>
              setForm({ ...form, batchId: e.target.value })
            }
          >
            <option value="">All Batches</option>
            {filteredBatches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        {/* VALID FROM */}
        <div className="space-y-2">
          <Label>Valid From</Label>
          <Input
            type="date"
            value={form.validFrom}
            onChange={(e) =>
              setForm({ ...form, validFrom: e.target.value })
            }
          />
        </div>

        {/* VALID TILL */}
        <div className="space-y-2">
          <Label>Valid Till</Label>
          <Input
            type="date"
            value={form.validTill}
            onChange={(e) =>
              setForm({ ...form, validTill: e.target.value })
            }
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button onClick={handleSubmit} className="bg-green-700">
          {editingId ? "Update Discount" : "Create Discount"}
        </Button>

        {editingId && (
          <Button
            variant="outline"
            onClick={() => {
              setEditingId(null);
              setForm(initialForm);
            }}
          >
            Cancel
          </Button>
        )}
      </div>

      {/* LIST */}
      <div className="pt-6">
        <h3 className="font-semibold mb-4">
          Existing Discounts
        </h3>

        {discounts.map((d) => (
          <div
            key={d._id}
            className="flex justify-between items-center border p-3 rounded-lg mb-2"
          >
            <div>
              <p className="font-medium">
                {d.title}{" "}
                {d.type === "percentage"
                  ? `${d.value}%`
                  : `₹${d.value}`}
              </p>

              <p className="text-sm text-gray-500">
                {d.planType && `Plan: ${d.planType} | `}
                {d.code && `Code: ${d.code} | `}
                {d.isActive ? "Active" : "Inactive"}
              </p>
            </div>

            <div className="flex gap-3 items-center">
              <Pencil
                className="cursor-pointer text-blue-600"
                onClick={() => handleEdit(d)}
              />

              <Button
                size="sm"
                variant="outline"
                onClick={() => toggleActive(d)}
              >
                {d.isActive ? "Disable" : "Enable"}
              </Button>

              <Trash2
                className="text-red-500 cursor-pointer"
                onClick={() => handleDelete(d._id)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
