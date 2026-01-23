import { useEffect, useState, useMemo } from "react";

import api from "@/lib/axios";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useToast } from "@/hooks/use-toast";
import { MoreHorizontal } from "lucide-react";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from "@/components/ui/select";


/* ================= CONSTANTS ================= */
const PAYMENT_MODES = ["cash", "upi", "bank", "razorpay"];
const PAYMENT_STATUS = ["paid", "unpaid", "pending"];

/* ================= UTIL ================= */
const addMonths = (dateStr, months) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
};



/* ================= COMPONENT ================= */
export default function CoachingEnrollment() {
   const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 6;
  function DatePicker({ value, onChange, disabled }) {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className="w-full justify-start text-left font-normal h-10 bg-white border border-gray-300"
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


  const { toast } = useToast();

  const [enrollments, setEnrollments] = useState([]);
  const [batches, setBatches] = useState([]);

  const [filters, setFilters] = useState({
    sport: "",
    batch: "",
    coach: "",
    status: "",
  });


  const [drawer, setDrawer] = useState(null); // add | view | edit
  const [selected, setSelected] = useState(null);

  const [form, setForm] = useState({
    planType: "monthly",
    paymentMode: "cash",
    paymentStatus: "paid",
  });

  /* ================= FETCH ================= */
  const fetchAll = async () => {
    try {
      const [eRes, bRes] = await Promise.all([
        api.get("/enrollments"),
        api.get("/batches"),
      ]);

      setEnrollments(eRes.data || []);
      setBatches(bRes.data || []);
    } catch {
      toast({
        title: "Error",
        description: "Failed to load enrollments",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ================= MAP BACKEND → FORM ================= */
  const mapEnrollmentToForm = (e) => ({
    playerName: e.playerName,
    age: e.age,
    mobile: e.mobile,
    email: e.email,

    batchName: e.batchName,
    coachName: e.coachName,
    monthlyFee: e.monthlyFee,

    planType: e.planType || "monthly",
    startDate: e.startDate?.slice(0, 10),
    endDate: e.endDate?.slice(0, 10),
    totalAmount: e.totalAmount,

    paymentMode: e.paymentMode || "cash",
    paymentStatus: e.paymentStatus || "unpaid",
  });

  const sports = [...new Set(enrollments.map(e => e.sportName).filter(Boolean))];
  const batchOptions = [...new Set(
    enrollments.map(e => e.batchName).filter(Boolean)
  )];

  const coaches = [...new Set(enrollments.map(e => e.coachName).filter(Boolean))];


  /* ================= ACTIONS ================= */
  const openAdd = () => {
    setForm({
      planType: "monthly",
      paymentMode: "cash",
      paymentStatus: "paid",
    });
    setSelected(null);
    setDrawer("add");
  };

  const openView = (e) => {
    setSelected(e);
    setForm(mapEnrollmentToForm(e));
    setDrawer("view");
  };

  const openEdit = (e) => {
    setSelected(e);
    setForm(mapEnrollmentToForm(e));
    setDrawer("edit");
  };

  /* ================= BATCH CHANGE ================= */
  const handleBatchChange = (batchName) => {
    const b = batches.find((x) => x.name === batchName);
    if (!b) return;

    const months = form.planType === "yearly" ? 12 : 1;

    setForm((p) => ({
      ...p,
      batchName: b.name,
      coachName: b.coachName,
      monthlyFee: b.monthlyFee,
      endDate: addMonths(p.startDate, months),
      totalAmount: b.monthlyFee * months,
    }));
  };

  /* ================= PLAN CHANGE ================= */
  const handlePlanChange = (plan) => {
    const months = plan === "yearly" ? 12 : 1;

    setForm((p) => ({
      ...p,
      planType: plan,
      endDate: addMonths(p.startDate, months),
      totalAmount: p.monthlyFee ? p.monthlyFee * months : "",
    }));
  };

  /* ================= SAVE ================= */
  const saveEnrollment = async () => {
    try {
      if (drawer === "add") {
        await api.post("/enrollments", {
          source: "admin",
          ...form,
        });

        toast({
          title: "Enrollment Added",
          description: "Player enrolled successfully",
        });
      } else {
        await api.put(`/enrollments/${selected._id}`, form);

        toast({
          title: "Enrollment Updated",
          description: "Changes saved successfully",
        });
      }

      setDrawer(null);
      fetchAll();
    } catch (err) {
      toast({
        title: "Error",
        description:
          err.response?.data?.message || "Failed to save enrollment",
        variant: "destructive",
      });
    }
  };

  /* ================= DELETE ================= */
  const deleteEnrollment = async (id) => {
    try {
      await api.delete(`/enrollments/${id}`);

      toast({
        title: "Deleted",
        description: "Enrollment removed",
      });

      fetchAll();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete enrollment",
        variant: "destructive",
      });
    }
  };

  const getEnrollmentStatus = (e) => {
    // 1️⃣ Pending payment = Pending enrollment
    if (e.paymentStatus === "pending") {
      return {
        label: "Pending",
        color: "bg-orange-100 text-orange-700",
      };
    }

    // 2️⃣ Expired / Expiring logic (based on endDate)
    if (!e.endDate) {
      return {
        label: "Active",
        color: "bg-green-100 text-green-700",
      };
    }

    const today = new Date();
    const end = new Date(e.endDate);

    const diffDays = Math.ceil(
      (end - today) / (1000 * 60 * 60 * 24)
    );

    if (diffDays < 0) {
      return {
        label: "Expired",
        color: "bg-gray-300 text-gray-800",
      };
    }

    if (diffDays <= 7) {
      return {
        label: "Expiring",
        color: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "Active",
      color: "bg-green-100 text-green-700",
    };
  };



  const filteredEnrollments = useMemo(() => {
    return enrollments.filter((e) => {
      const statusLabel = getEnrollmentStatus(e).label;

      return (
        (!filters.sport || e.sportName === filters.sport) &&
        (!filters.batch || e.batchName === filters.batch) &&
        (!filters.coach || e.coachName === filters.coach) &&
        (!filters.status || statusLabel === filters.status)
      );
    });
  }, [enrollments, filters]);

  const totalPages = Math.ceil(
    filteredEnrollments.length / ITEMS_PER_PAGE
  );

  const paginatedEnrollments = filteredEnrollments.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [filters]);



  const filterTriggerClass =
    "h-9 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-green-600";

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




  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Coaching Enrollment Overview</h1>

        <Button onClick={openAdd} className="bg-green-700">
          + Add New Enrollment
        </Button>
      </div>

      {/* FILTERS */}
      <div className="bg-white border rounded-xl p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">

          <Select
            value={filters.sport || "all"}
            onValueChange={(value) =>
              setFilters((p) => ({ ...p, sport: value === "all" ? "" : value }))
            }
          >
            <SelectTrigger className={filterTriggerClass}>
              <SelectValue placeholder="All Sports" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              sideOffset={4}
              className="z-[9999] bg-white border shadow-lg"
            >
              <SelectItem value="all" className={selectItemClass}>All Sports</SelectItem>
              {sports.map((s) => (
                <SelectItem key={s} value={s} className={selectItemClass}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>


          <Select
            value={filters.batch || "all"}
            onValueChange={(value) =>
              setFilters((p) => ({ ...p, batch: value === "all" ? "" : value }))
            }
          >
            <SelectTrigger className={filterTriggerClass}>
              <SelectValue placeholder="All Batches" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              sideOffset={4}
              className="z-[9999] bg-white border shadow-lg"
            >
              <SelectItem value="all" className={selectItemClass}>All Batches</SelectItem>
              {batchOptions.map((b) => (
                <SelectItem key={b} value={b} className={selectItemClass}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>


          <Select
            value={filters.coach || "all"}
            onValueChange={(value) =>
              setFilters((p) => ({ ...p, coach: value === "all" ? "" : value }))
            }
          >
            <SelectTrigger className={filterTriggerClass}>
              <SelectValue placeholder="All Coaches" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              sideOffset={4}
              className="z-[9999] bg-white border shadow-lg"
            >
              <SelectItem value="all" className={selectItemClass}>All Coaches</SelectItem>
              {coaches.map((c) => (
                <SelectItem key={c} value={c} className={selectItemClass}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>


          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              setFilters((p) => ({
                ...p,
                status: value === "all" ? "" : value,
              }))
            }
          >
            <SelectTrigger className={filterTriggerClass}>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>

            <SelectContent
              position="popper"
              sideOffset={4}
              className="z-[9999] bg-white border shadow-lg"
            >
              <SelectItem value="all" className={selectItemClass}>
                All Status
              </SelectItem>
              <SelectItem value="Pending" className={selectItemClass}>
                Pending
              </SelectItem>
              <SelectItem value="Active" className={selectItemClass}>
                Active
              </SelectItem>
              <SelectItem value="Expiring" className={selectItemClass}>
                Expiring
              </SelectItem>
              <SelectItem value="Expired" className={selectItemClass}>
                Expired
              </SelectItem>
            </SelectContent>
          </Select>



        </div>


        {/* TABLE */}

        <div className="bg-white rounded-xl border mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 ">
              <tr className="text-left">
                <th className="p-3">Student</th>
                <th>Age</th>
                <th>Sport</th>
                <th>Batch</th>
                <th>Start Date</th>
                <th>Status</th>
                <th className="text-right pr-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedEnrollments.map((e) => {
                const status = (() => {
                  if (e.status === "pending")
                    return { label: "Pending", color: "bg-orange-100 text-orange-700" };
                  if (e.status === "cancelled")
                    return { label: "Cancelled", color: "bg-red-100 text-red-700" };
                  if (!e.endDate)
                    return { label: "-", color: "bg-gray-200 text-gray-700" };

                  const diffDays = Math.ceil(
                    (new Date(e.endDate) - new Date()) / (1000 * 60 * 60 * 24)
                  );

                  if (diffDays < 0)
                    return { label: "Expired", color: "bg-gray-300 text-gray-800" };
                  if (diffDays <= 7)
                    return { label: "Expiring", color: "bg-yellow-100 text-yellow-700" };

                  return { label: "Active", color: "bg-green-100 text-green-700" };
                })();

                return (
                  <tr key={e._id} className="border-t">
                    <td className="p-3 font-medium">{e.playerName}</td>
                    <td>{e.age}</td>
                    <td>{e.sportName}</td>
                    <td className="max-w-[220px] truncate">{e.batchName}</td>
                    <td>{e.startDate?.slice(0, 10)}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-[0.65rem] ${status.color}`}>
                        {status.label}
                      </span>
                    </td>
                    <td className="text-right pr-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 hover:bg-gray-100 rounded">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => openView(e)}>View</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(e)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => deleteEnrollment(e._id)}
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
              {Math.min(page * ITEMS_PER_PAGE, filteredEnrollments.length)} of{" "}
              {filteredEnrollments.length}
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
      </div>



      {/* DRAWER */}
      <Sheet open={!!drawer} onOpenChange={() => setDrawer(null)}>
        <SheetContent side="right" className="w-[40vw]">
          <SheetHeader>
            <SheetTitle>
              {drawer === "add"
                ? "Add Enrollment"
                : drawer === "edit"
                  ? "Edit Enrollment"
                  : "View Enrollment"}
            </SheetTitle>
          </SheetHeader>

          <div className="grid grid-cols-2 gap-4 mt-6">
            {[
              ["playerName", "Player Name"],
              ["age", "Age"],
              ["mobile", "Mobile"],
              ["email", "Email"],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="text-sm font-medium">{label}</label>
                <Input
                  disabled={drawer === "view"}
                  value={form[key] || ""}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.value })
                  }
                />
              </div>
            ))}

            {/* Batch */}
            <div className="col-span-2">
              <label className="text-sm font-medium">Batch</label>
              <Select
                disabled={drawer === "view"}
                value={form.batchName || ""}
                onValueChange={(value) => handleBatchChange(value)}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue placeholder="Select batch" />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="z-[9999] bg-white border shadow-lg"
                >
                  {batches.map((b) => (
                    <SelectItem
                      key={b._id}
                      value={b.name}
                      className={selectItemClass}
                    >
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Plan */}
            <div>
              <label className="text-sm font-medium">Plan</label>
              <Select
                disabled={drawer === "view"}
                value={form.planType}
                onValueChange={(value) => handlePlanChange(value)}
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="z-[9999] bg-white border shadow-lg"
                >
                  <SelectItem value="monthly" className={selectItemClass}>
                    Monthly
                  </SelectItem>
                  <SelectItem value="yearly" className={selectItemClass}>
                    Yearly
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div>
              <label className="text-sm font-medium">Start Date</label>
              <DatePicker
                disabled={drawer === "view"}
                value={form.startDate}
                onChange={(date) =>
                  setForm({
                    ...form,
                    startDate: date,
                    endDate: addMonths(
                      date,
                      form.planType === "yearly" ? 12 : 1
                    ),
                  })
                }
              />


            </div>

            {/* Coach */}
            <div>
              <label className="text-sm font-medium">Coach</label>
              <Input disabled value={form.coachName || ""} />
            </div>

            {/* Monthly Fee */}
            <div>
              <label className="text-sm font-medium">Monthly Fee</label>
              <Input disabled value={form.monthlyFee || ""} />
            </div>

            {/* Payment Mode */}
            <div>
              <label className="text-sm font-medium">Payment Mode</label>
              <Select
                disabled={drawer === "view"}
                value={form.paymentMode}
                onValueChange={(value) =>
                  setForm({ ...form, paymentMode: value })
                }
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="z-[9999] bg-white border shadow-lg"
                >
                  {PAYMENT_MODES.map((p) => (
                    <SelectItem
                      key={p}
                      value={p}
                      className={selectItemClass}
                    >
                      {p.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Payment Status */}
            <div>
              <label className="text-sm font-medium">Payment Status</label>
              <Select
                disabled={drawer === "view"}
                value={form.paymentStatus}
                onValueChange={(value) =>
                  setForm({ ...form, paymentStatus: value })
                }
              >
                <SelectTrigger className={selectTriggerClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="z-[9999] bg-white border shadow-lg"
                >
                  {PAYMENT_STATUS.map((p) => (
                    <SelectItem
                      key={p}
                      value={p}
                      className={selectItemClass}
                    >
                      {p.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Total Amount */}
            <div className="col-span-2">
              <label className="text-sm font-medium">Total Amount</label>
              <Input disabled value={form.totalAmount || ""} />
            </div>
          </div>

          {drawer !== "view" && (
            <Button
              className="mt-6 w-full bg-green-700"
              onClick={saveEnrollment}
            >
              {drawer === "add" ? "Add Enrollment" : "Update Enrollment"}
            </Button>
          )}
        </SheetContent>
      </Sheet>

    </div>
  );
}
