import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { MoreVertical, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Check } from "lucide-react";



export default function Facilities() {
  const { toast } = useToast();
  const [facilities, setFacilities] = useState([]);

  // drawer: null | add | view | edit
  const [drawer, setDrawer] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [existingImages, setExistingImages] = useState([]); // DB paths only
  const [imagePreviews, setImagePreviews] = useState([]);   // UI preview URLs


  // dropdown menu
  const [menu, setMenu] = useState(null); // { x, y, facility }

  const [form, setForm] = useState({
    name: "",
    type: "",
    capacity: "",
    hourlyRate: "",
    status: "active",
    images: [],
  });



  /* ================= FETCH ================= */
  const loadFacilities = async () => {
    try {
      const res = await api.get("/facilities");
      setFacilities(res.data);
    } catch (err) {
      toast({
        title: "Failed to load facilities",
        description: err?.response?.data?.message || "Server error",
        variant: "destructive",
      });
    }
  };


  useEffect(() => {
    loadFacilities();
  }, []);

  /* ================= DROPDOWN ================= */
  const openMenu = (e, facility) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({
      facility,
      x: rect.right - 150,
      y: rect.bottom + 8,
    });
  };

  useEffect(() => {
    const close = () => setMenu(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  /* ================= DRAWER HELPERS ================= */
  const resetForm = () => {
    setForm({
      name: "",
      type: "",
      capacity: "",
      hourlyRate: "",
      status: "active",
      images: [],
    });
    setImagePreviews([]);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);

    // IMPORTANT: wait for animation
    setTimeout(() => {
      setDrawer(null);
      setSelected(null);
      resetForm();
    }, 300);
  };

  const openAdd = () => {
    setMenu(null); // ✅ force close dropdown
    resetForm();
    setDrawer("add");
    setIsDrawerOpen(true);
  };

  const openView = (f) => {
    setMenu(null);
    setSelected(f);

    setExistingImages(f.images || []); // ✅ DB paths
    setImagePreviews(
      (f.images || []).map((img) => `http://localhost:5000${img}`)
    );

    setDrawer("view");
    setIsDrawerOpen(true);
  };


  const openEdit = (f) => {
    setSelected(f);
    setForm({
      name: f.name,
      type: f.type,
      capacity: f.capacity,
      hourlyRate: f.hourlyRate,
      status: f.status,
      images: [],
    });

    setExistingImages(f.images || []); // ✅ DB paths
    setImagePreviews(
      (f.images || []).map((img) => `http://localhost:5000${img}`)
    );

    setDrawer("edit");
    setIsDrawerOpen(true);
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };



  /* ================= IMAGE HANDLING ================= */
  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    setForm({ ...form, images: files });
    setImagePreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  /* ================= CRUD ================= */
  const saveFacility = async () => {
    try {
      const fd = new FormData();

      fd.append("name", form.name);
      fd.append("type", form.type);
      fd.append("capacity", form.capacity);
      fd.append("hourlyRate", form.hourlyRate);
      fd.append("status", form.status);

      // ✅ send DB paths only
      fd.append("existingImages", JSON.stringify(existingImages));

      // ✅ send new uploads only
      form.images.forEach((img) => fd.append("images", img));

      if (drawer === "add") {
        await api.post("/facilities", fd);
        toast({
          title: "Facility added",
          description: "New facility has been created successfully.",
        });
      } else {
        await api.put(`/facilities/${selected._id}`, fd);
        toast({
          title: "Facility updated",
          description: "Facility details updated successfully.",
        });
      }

      closeDrawer();
      loadFacilities();
    } catch (err) {
      toast({
        title: "Action failed",
        description: err?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };


  const deleteFacility = async (id) => {
    setMenu(null);

    if (!confirm("Delete this facility?")) return;

    try {
      await api.delete(`/facilities/${id}`);
      toast({
        title: "Facility deleted",
        description: "The facility has been removed successfully.",
      });
      loadFacilities();
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err?.response?.data?.message || "Server error",
        variant: "destructive",
      });
    }
  };


  /* ================= STATS ================= */
  const total = facilities.length;
  const active = facilities.filter((f) => f.status === "active").length;
  const maintenance = facilities.filter((f) => f.status === "maintenance").length;
  const disabled = facilities.filter((f) => f.status === "disabled").length;

  // ================= STATUS CONFIG =================
  const FACILITY_STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "maintenance", label: "Maintenance" },
    { value: "disabled", label: "Disabled" },
  ];

  const STATUS_STYLES = {
    active: "bg-green-100 text-green-700",
    maintenance: "bg-orange-100 text-orange-700",
    disabled: "bg-red-100 text-red-700",
  };



  return (
    <div className="text-sm">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-semibold text-green-800">Facilities</h1>
        <button
          onClick={openAdd}
          className="bg-orange-500 text-white px-5 py-2 rounded-md font-medium"
        >
          + Add Facility
        </button>
      </div>

      {/* Stats */}
      {/* Stats (ADMIN STATUS ONLY) */}
      <div className="grid grid-cols-4 gap-4 mb-5">
        {[
          ["Total Facilities", total, "text-green-700"],
          ["Active", facilities.filter(f => f.status === "active").length, "text-emerald-600"],
          ["Maintenance", facilities.filter(f => f.status === "maintenance").length, "text-amber-600"],
          ["Disabled", facilities.filter(f => f.status === "disabled").length, "text-red-600"],
        ].map(([label, val, color]) => (
          <div key={label} className="bg-white border rounded-lg p-4">
            <div className={`text-xl font-semibold ${color}`}>{val}</div>
            <div className="text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="p-4 text-left">Image</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-center">Type</th>
              <th className="p-4 text-center">Admin Status</th>
              <th className="p-4 text-center">Capacity</th>
              <th className="p-4 text-center">Rate</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>

          <tbody>
            {facilities.map((f) => (
              <tr key={f._id} className="border-t hover:bg-gray-50">
                <td className="p-4">
                  {f.images?.[0] ? (
                    <img
                      src={`http://localhost:5000${f.images[0]}`}
                      className="w-14 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-14 h-10 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                      N/A
                    </div>
                  )}
                </td>

                <td className="p-4 font-medium">{f.name}</td>

                <td className="p-4 text-center">{f.type}</td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${STATUS_STYLES[f.status] || "bg-gray-100 text-gray-600"
                      }`}
                  >
                    {f.status}
                  </span>

                </td>

                <td className="p-4 text-center">{f.capacity}</td>
                <td className="p-4 text-center">₹{f.hourlyRate}</td>

                <td className="p-4 text-right">
                  <button onClick={(e) => openMenu(e, f)}>
                    <MoreVertical />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>


      {/* Dropdown (never shown when drawer is open) */}
      {menu && !isDrawerOpen && (
        <div
          style={{ top: menu.y, left: menu.x }}
          className="fixed z-[9999] w-36 bg-white rounded-lg border shadow-lg animate-dropdown"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => openView(menu.facility)} className="block w-full px-4 py-2 text-left hover:bg-gray-100">
            View
          </button>
          <button onClick={() => openEdit(menu.facility)} className="block w-full px-4 py-2 text-left hover:bg-gray-100">
            Edit
          </button>
          <button onClick={() => deleteFacility(menu.facility._id)} className="block w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100">
            Delete
          </button>
        </div>
      )}


      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Overlay */}
        <div
          className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0"
            }`}
          onClick={closeDrawer}
        />

        {/* Sheet */}
        <div
          className={`absolute right-0 top-0 h-full w-[420px] bg-white transform transition-transform duration-300 ease-out ${isDrawerOpen ? "translate-x-0" : "translate-x-full"
            } pointer-events-auto`}
        >
          <div className="p-6 overflow-y-auto h-full">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold capitalize">
                {drawer} Facility
              </h2>
              <button onClick={closeDrawer}>
                <X />
              </button>
            </div>

            {/* Body */}
            <div className="space-y-5 text-sm">
              {/* Facility Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Facility Name
                </label>
                <input
                  className={`w-full border rounded-md px-3 py-2 ${drawer === "view" ? "bg-gray-50 text-gray-700" : ""
                    }`}
                  value={drawer === "view" ? selected?.name : form.name}
                  disabled={drawer === "view"}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Facility Type
                </label>
                <input
                  className={`w-full border rounded-md px-3 py-2 ${drawer === "view" ? "bg-gray-50 text-gray-700" : ""
                    }`}
                  value={drawer === "view" ? selected?.type : form.type}
                  disabled={drawer === "view"}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                />
              </div>
              {/* Facility Status */}
              {/* Facility Status */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Facility Status
                </label>

                {/* VIEW MODE */}
                {drawer === "view" ? (
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[selected?.status] ??
                        "bg-gray-100 text-gray-600"
                        }`}
                    >
                      {
                        FACILITY_STATUS_OPTIONS.find(
                          (s) => s.value === selected?.status
                        )?.label
                      }
                    </span>
                  </div>
                ) : (
                  /* ADD / EDIT MODE — SHADCN SELECT */
                  <Select
                    value={form.status}
                    onValueChange={(value) =>
                      setForm({ ...form, status: value })
                    }
                  >
                    <SelectTrigger
                      className="
          h-11
          w-full
          rounded-lg
          border
          px-4
          text-sm
          text-left
          truncate-none
          whitespace-normal
        "
                    >
                      <SelectValue>
                        {
                          FACILITY_STATUS_OPTIONS.find(
                            (s) => s.value === form.status
                          )?.label
                        }
                      </SelectValue>
                    </SelectTrigger>

                    {/* forceMount prevents Radix DOM crash */}
                    <SelectContent
                      forceMount
                      className="rounded-lg z-[9999] bg-white border shadow-lg "
                    >
                      {FACILITY_STATUS_OPTIONS.map((opt) => {
                        const isSelected = form.status === opt.value;

                        return (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="
                                      flex items-center justify-between
                                      rounded-md
                                      px-4 py-2
                                      text-sm
                                      data-[highlighted]:bg-green-50
                                      data-[state=checked]:bg-green-700
                          data-[state=checked]:text-white cursor-pointer
                                    "
                          >
                            <span className="whitespace-normal">
                              {opt.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}

                <p className="mt-1 text-[11px] text-gray-400">
                  Maintenance or disabled facilities cannot be booked
                </p>
              </div>




              {/* Capacity & Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Capacity
                  </label>
                  <input
                    className={`w-full border rounded-md px-3 py-2 ${drawer === "view" ? "bg-gray-50 text-gray-700" : ""
                      }`}
                    value={
                      drawer === "view"
                        ? selected?.capacity
                        : form.capacity
                    }
                    disabled={drawer === "view"}
                    onChange={(e) =>
                      setForm({ ...form, capacity: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Hourly Rate (₹)
                  </label>
                  <input
                    className={`w-full border rounded-md px-3 py-2 ${drawer === "view" ? "bg-gray-50 text-gray-700" : ""
                      }`}
                    value={
                      drawer === "view"
                        ? selected?.hourlyRate
                        : form.hourlyRate
                    }
                    disabled={drawer === "view"}
                    onChange={(e) =>
                      setForm({ ...form, hourlyRate: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Upload Images (Add / Edit only) */}
              {drawer !== "view" && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Upload Images
                  </label>
                  <input type="file" multiple onChange={handleImages} />
                </div>
              )}

              {/* Image Preview */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">
                  Facility Images
                </label>

                {imagePreviews.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.map((img, i) => (
                      <div key={i} className="relative">
                        <img
                          src={img}
                          className="h-20 w-full object-cover rounded border"
                        />
                        {drawer !== "view" && (
                          <button
                            onClick={() => removeExistingImage(i)}
                            className="absolute top-1 right-1 bg-black/60 text-white rounded-full px-2 text-xs"
                          >
                            ✕
                          </button>

                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">
                    No images uploaded
                  </p>
                )}
              </div>

              {/* Action Button */}
              {drawer !== "view" && (
                <button
                  onClick={saveFacility}
                  className="w-full bg-green-700 text-white py-3 rounded-md font-medium mt-4"
                >
                  {drawer === "add" ? "Add Facility" : "Save Changes"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
