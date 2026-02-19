import { useEffect, useState, useRef } from "react";
import api from "@/lib/axios";
import {
  MoreVertical,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const ITEMS_PER_PAGE = 5;
const MOBILE_BREAKPOINT = 768;

export default function Facilities() {
  const { toast } = useToast();
  const menuRef = useRef(null);

  const [facilities, setFacilities] = useState([]);
  const [sports, setSports] = useState([]);

  const [drawer, setDrawer] = useState(null); // add | edit | view
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [menu, setMenu] = useState(null);
  const [page, setPage] = useState(1);
  const [isMobile, setIsMobile] = useState(
    window.innerWidth < MOBILE_BREAKPOINT
  );

  const [form, setForm] = useState({
    name: "",
    type: "",
    hourlyRate: "",
    status: "active",
    sports: [],
  });

  /* ================= FETCH ================= */
  const loadFacilities = async () => {
    const res = await api.get("/facilities");
    setFacilities(Array.isArray(res.data) ? res.data : []);
  };

  const loadSports = async () => {
    const res = await api.get("/sports");
    setSports(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => {
    loadFacilities();
    loadSports();
  }, []);

  /* ================= RESPONSIVE ================= */
  useEffect(() => {
    const resize = () =>
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  /* ================= PAGINATION ================= */
  const totalPages = Math.max(
    1,
    Math.ceil(facilities.length / ITEMS_PER_PAGE)
  );

  const paginatedFacilities = facilities.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  /* ================= MENU ================= */
  const openMenu = (e, f) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setMenu({
      facility: f,
      x: rect.right - 140,
      y: rect.bottom + 6,
    });
  };

  useEffect(() => {
    const close = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenu(null);
      }
    };
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  /* ================= DRAWER ================= */
  const resetForm = () => {
    setForm({
      name: "",
      type: "",
      hourlyRate: "",
      status: "active",
      sports: [],
    });
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setDrawer(null);
      setSelected(null);
      resetForm();
    }, 300);
  };

  const openAdd = () => {
    resetForm();
    setDrawer("add");
    setIsDrawerOpen(true);
  };

  const openView = (f) => {
    setSelected(f);
    setForm({
      name: f.name,
      type: f.type,
      hourlyRate: f.hourlyRate,
      status: f.status,
      sports: f.sports.map((s) => s._id),
    });
    setDrawer("view");
    setIsDrawerOpen(true);
    setMenu(null);
  };

  const openEdit = (f) => {
    setSelected(f);
    setForm({
      name: f.name,
      type: f.type,
      hourlyRate: f.hourlyRate,
      status: f.status,
      sports: f.sports.map((s) => s._id),
    });
    setDrawer("edit");
    setIsDrawerOpen(true);
    setMenu(null);
  };

  /* ================= FORM ================= */
  const toggleSport = (id) => {
    setForm((prev) => ({
      ...prev,
      sports: prev.sports.includes(id)
        ? prev.sports.filter((s) => s !== id)
        : [...prev.sports, id],
    }));
  };

  /* ================= SAVE ================= */
  const saveFacility = async () => {
    try {
      const payload = {
        name: form.name,
        type: form.type,
        hourlyRate: Number(form.hourlyRate),
        status: form.status,
        sports: form.sports,
      };

      drawer === "add"
        ? await api.post("/facilities", payload)
        : await api.put(`/facilities/${selected._id}`, payload);

      toast({ title: "Facility saved successfully" });
      closeDrawer();
      loadFacilities();
    } catch (err) {
      toast({
        title: "Action failed",
        description:
          err?.response?.data?.message || "Server error",
        variant: "destructive",
      });
    }
  };

  const deleteFacility = async (id) => {
    if (!confirm("Are you sure you want to delete this facility?")) return;

    try {
      await api.delete(`/facilities/${id}`);
      toast({ title: "Facility deleted successfully" });
      setMenu(null);
      loadFacilities();
    } catch (err) {
      toast({
        title: "Delete failed",
        description:
          err?.response?.data?.message || "Server error",
        variant: "destructive",
      });
    }
  };

  /* ================= CONFIG ================= */
  const STATUS_STYLES = {
    active: "bg-green-100 text-green-700",
    maintenance: "bg-orange-100 text-orange-700",
    disabled: "bg-red-100 text-red-700",
  };

  const FACILITY_STATUS_OPTIONS = [
    { value: "active", label: "Active" },
    { value: "maintenance", label: "Maintenance" },
    { value: "disabled", label: "Disabled" },
  ];

  const isView = drawer === "view";

  /* ================= UI ================= */
  return (
    <div className="text-sm">
      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h1 className="text-md sm:text-xl font-semibold text-green-800">
          Facilities
        </h1>
        <button
          onClick={openAdd}
          className="bg-orange-500 text-white px-5 py-2 rounded-md"
        >
          + Add Facility
        </button>
      </div>

      {/* TABLE */}
      <div className="hidden md:block bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 text-left">Facility</th>
              <th className="p-4 text-left">Sports</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Rate</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedFacilities.map((f) => (
              <tr key={f._id} className="border-t">
                <td className="p-4 font-medium">{f.name}</td>

                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {f.sports.map((sp) => (
                      <span
                        key={sp._id}
                        className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs"
                      >
                        {sp.name}
                      </span>
                    ))}
                  </div>
                </td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${STATUS_STYLES[f.status]}`}
                  >
                    {f.status}
                  </span>
                </td>

                <td className="p-4 text-center">
                  ₹{f.hourlyRate}
                </td>

                <td className="p-4 text-right relative">
                  <button onClick={(e) => openMenu(e, f)}>
                    <MoreVertical />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* ================= MOBILE CARD VIEW ================= */}
      <div className="md:hidden space-y-4">
        {paginatedFacilities.map((f) => (
          <div
            key={f._id}
            className="bg-white border rounded-xl p-4 shadow-sm"
          >
            {/* Top Section */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-base">{f.name}</h3>
                <p className="text-sm text-muted-foreground">
                  ₹{f.hourlyRate} per slot
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[0.65rem] ${STATUS_STYLES[f.status]}`}
                >
                  {f.status}
                </span>

                <button
                  onClick={(e) => openMenu(e, f)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sports Section */}
            <div className="mt-3 flex flex-wrap gap-2">
              {f.sports.map((sp) => (
                <span
                  key={sp._id}
                  className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs"
                >
                  {sp.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>


      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft />
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            <ChevronRight />
          </button>
        </div>
      )}

      {/* DRAWER */}
      <Sheet
        open={!!drawer}
        onOpenChange={(open) => {
          if (!open) closeDrawer();
        }}
      >
        <SheetContent
          side={isMobile ? "bottom" : "right"}
          className={
            isMobile
              ? "h-[85vh] rounded-t-2xl flex flex-col"
              : "w-[420px] h-screen flex flex-col"
          }
        >
          <SheetHeader>
            <SheetTitle className="capitalize">
              {drawer} Facility
            </SheetTitle>
          </SheetHeader>

          {/* FORM */}
          <div className="mt-6 space-y-5">
            {/* Facility Name */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Facility Name</label>
              <input
                disabled={isView}
                placeholder="Enter facility name"
                className="w-full h-10 border rounded-md px-3 disabled:bg-gray-50 text-[13px]"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            {/* Facility Type */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Facility Type</label>
              <input
                disabled={isView}
                placeholder="Enter facility type"
                className="w-full h-10 border rounded-md px-3 disabled:bg-gray-50 text-[13px]"
                value={form.type}
                onChange={(e) =>
                  setForm({ ...form, type: e.target.value })
                }
              />
            </div>

            {/* Hourly Rate */}
            <div className="space-y-1">
              <label className="text-sm font-medium">Slot Rate (₹)</label>
              <input
                disabled={isView}
                placeholder="Enter slot rate "
                type="number"
                className="w-full h-10 border rounded-md px-3 disabled:bg-gray-50 text-[16px]"
                value={form.hourlyRate}
                onChange={(e) =>
                  setForm({ ...form, hourlyRate: e.target.value })
                }
              />
            </div>

            {/* Sports */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Supported Sports
              </label>
              <div className="grid grid-cols-2 gap-2 border rounded-md p-3">
                {sports.map((s) => (
                  <label
                    key={s._id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      disabled={isView}
                      checked={form.sports.includes(s._id)}
                      onChange={() => toggleSport(s._id)}
                      className="accent-green-600"
                    />
                    {s.name}
                  </label>
                ))}
              </div>
            </div>

            {!isView && (
              <button
                onClick={saveFacility}
                className="w-full h-12 bg-green-700 text-white rounded-md font-medium"
              >
                Save Facility
              </button>
            )}
          </div>
        </SheetContent>
      </Sheet>


      {/* MENU */}
      {menu && (
        <div
          ref={menuRef}
          style={{ top: menu.y, left: menu.x }}
          className="fixed z-[9999] w-32 bg-white border rounded-xl shadow"
        >
          <button
            onClick={() => openView(menu.facility)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            View
          </button>
          <button
            onClick={() => openEdit(menu.facility)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            Edit
          </button>
          <button
            onClick={() => deleteFacility(menu.facility._id)}
            className="w-full px-4 py-2 text-left text-red-600 hover:bg-gray-100"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
