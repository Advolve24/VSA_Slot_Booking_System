import { useRef, useEffect, useState } from "react";
import api from "@/lib/axios";
import { Plus, MoreVertical, X, CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

/* ================= PAYMENT STATUS ================= */
const PAYMENT_STATUS_STYLES = {
    paid: "bg-green-100 text-green-700",
    pending: "bg-orange-100 text-orange-700",
    unpaid: "bg-red-100 text-red-700",
};

/* ================= SLOT STYLES ================= */
const SLOT_STYLES = {
    available: "border-green-300 bg-green-50 text-green-700",
    booked: "border-red-300 bg-red-50 text-red-400 cursor-not-allowed",
    blocked: "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed",
    selected: "border-green-700 bg-green-700 text-white",
};

export default function TurfRentals() {
    const { toast } = useToast();

    /* ================= DATA ================= */
    const [rentals, setRentals] = useState([]);
    const [facilities, setFacilities] = useState([]);
    const [sports, setSports] = useState([]);
    const [slots, setSlots] = useState([]);

    /* ================= UI ================= */
    const [drawer, setDrawer] = useState(null); // add | view | edit
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [menu, setMenu] = useState(null);
    const [selected, setSelected] = useState(null);
    const [dateOpen, setDateOpen] = useState(false);
    const menuRef = useRef(null);

    const [hourlyRate, setHourlyRate] = useState(0);

    /* ================= FORM ================= */
    const [form, setForm] = useState({
        userName: "",
        phone: "",
        facilityId: "",
        sport: "",
        rentalDate: null,
        selectedSlots: [],
        paymentStatus: "pending",
        paymentMode: "cash",
        totalAmount: 0,
    });

    /* 🔥 SET HOURLY RATE WHEN FACILITY CHANGES */
    useEffect(() => {
        if (!form.facilityId) return;

        const f = facilities.find(x => x._id === form.facilityId);
        if (f?.hourlyRate) setHourlyRate(f.hourlyRate);
    }, [form.facilityId, facilities]);

    /* 💰 AUTO CALCULATE TOTAL */
    useEffect(() => {
        if (!hourlyRate) return;

        setForm(prev => ({
            ...prev,
            totalAmount: prev.selectedSlots.length * hourlyRate,
        }));
    }, [form.selectedSlots, hourlyRate]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenu(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    /* ================= LOAD DATA ================= */
    const loadRentals = async () => {
        const res = await api.get("/turf-rentals");
        setRentals(res.data);
    };

    const loadFacilities = async () => {
        const res = await api.get("/facilities");
        setFacilities(res.data.filter((f) => f.status === "active"));
    };

    const loadSports = async () => {
        const res = await api.get("/sports");
        setSports(res.data);
    };

    useEffect(() => {
        loadRentals();
        loadFacilities();
        loadSports();
    }, []);



    /* ================= SLOTS ================= */
    const loadSlots = async (facilityId, date) => {
        if (!facilityId || !date) return;
        const res = await api.get(
            `/facilities/${facilityId}/slots?date=${date}`
        );
        setSlots(res.data);
    };

    const toggleSlot = (slot) => {
        if (slot.status !== "available") return;

        setForm(prev => {
            const updated = prev.selectedSlots.includes(slot.time)
                ? prev.selectedSlots.filter(t => t !== slot.time)
                : [...prev.selectedSlots, slot.time];

            return {
                ...prev,
                selectedSlots: updated,
            };
        });
    };



    /* ================= DRAWER ================= */
    const openAdd = () => {
        setForm({
            userName: "",
            phone: "",
            facilityId: "",
            sport: "",
            rentalDate: null,
            selectedSlots: [],
            paymentStatus: "pending",
            paymentMode: "cash",
            totalAmount: 0,
        });
        setSlots([]);
        setDrawer("add");
        setIsDrawerOpen(true);
    };


    const openView = async (r) => {
        setSelected(r);

        // 🔁 Generate selected slots from booking
        const startHour = Number(r.startTime.split(":")[0]);
        const endHour = Number(r.endTime.split(":")[0]);

        const selectedSlots = [];
        for (let h = startHour; h < endHour; h++) {
            selectedSlots.push(`${String(h).padStart(2, "0")}:00`);
        }

        // ✅ SET FORM (THIS WAS MISSING)
        setForm({
            userName: r.userName,
            phone: r.phone,
            facilityId: r.facilityId?._id,
            sport: r.sport,
            rentalDate: new Date(r.rentalDate),
            selectedSlots,
            paymentStatus: r.paymentStatus,
            paymentMode: r.paymentMode,
            totalAmount: r.totalAmount ?? selectedSlots.length * hourlyRate,
        });

        // 🔥 Load slot availability (read-only)
        if (r.facilityId?._id && r.rentalDate) {
            await loadSlots(
                r.facilityId._id,
                format(new Date(r.rentalDate), "yyyy-MM-dd")
            );
        }

        setDrawer("view");
        setIsDrawerOpen(true);
    };

    const openEdit = async (r) => {
        setSelected(r);

        // 🔓 OPEN DRAWER FIRST (CRITICAL FIX)
        setDrawer("edit");
        setIsDrawerOpen(true);

        // 🔁 Generate selected slots from booking
        const startHour = Number(r.startTime.split(":")[0]);
        const endHour = Number(r.endTime.split(":")[0]);

        const selectedSlots = [];
        for (let h = startHour; h < endHour; h++) {
            selectedSlots.push(`${String(h).padStart(2, "0")}:00`);
        }

        // 🧾 Set form values
        setForm({
            userName: r.userName,
            phone: r.phone,
            facilityId: r.facilityId?._id,
            sport: r.sport,
            rentalDate: new Date(r.rentalDate),
            selectedSlots,
            paymentStatus: r.paymentStatus,
            paymentMode: r.paymentMode,
            totalAmount: selectedSlots.length * hourlyRate,
        });

        // 🔥 Load slots AFTER drawer opens
        if (r.facilityId?._id && r.rentalDate) {
            loadSlots(
                r.facilityId._id,
                format(new Date(r.rentalDate), "yyyy-MM-dd")
            );
        }
    };

    const closeDrawer = () => {
        setIsDrawerOpen(false);
        setTimeout(() => {
            setDrawer(null);
            setSelected(null);
        }, 300);
    };

    /* ================= SAVE ================= */
    const saveRental = async () => {
        try {
            if (!form.selectedSlots.length) {
                toast({
                    title: "Select at least one slot",
                    variant: "destructive",
                });
                return;
            }

            const sorted = [...form.selectedSlots].sort();
            const startTime = sorted[0];
            const endHour =
                Number(sorted[sorted.length - 1].split(":")[0]) + 1;

            const payload = {
                ...form,
                rentalDate: format(form.rentalDate, "yyyy-MM-dd"),
                startTime,
                endTime: `${String(endHour).padStart(2, "0")}:00`,
                durationHours: sorted.length,
            };

            if (drawer === "add") {
                await api.post("/turf-rentals", payload);
                toast({ title: "Rental added" });
            } else {
                await api.patch(`/turf-rentals/${selected._id}`, payload);
                toast({ title: "Rental updated" });
            }

            closeDrawer();
            loadRentals();
        } catch (err) {
            toast({
                title: "Action failed",
                description: err?.response?.data?.message || "Server error",
                variant: "destructive",
            });
        }
    };

    const deleteRental = async (id) => {
        if (!confirm("Delete this rental?")) return;
        await api.delete(`/turf-rentals/${id}`);
        toast({ title: "Rental deleted" });
        loadRentals();
    };

    /* ================= STATS ================= */
    const total = rentals.length;
    const confirmed = rentals.filter((r) => r.bookingStatus === "confirmed").length;
    const pending = rentals.filter((r) => r.bookingStatus === "pending").length;
    const revenue = rentals.reduce((a, r) => a + (r.totalAmount || 0), 0);

    /* ================= RENDER SLOT ================= */
    const renderSlot = (slot) => {
        const isSelected = form.selectedSlots.includes(slot.time);

        /* ================= VIEW MODE (READ ONLY) ================= */
        if (drawer === "view") {
            if (!isSelected) return null;

            return (
                <div
                    key={slot.time}
                    className="px-4 py-2 rounded-xl border text-sm
                   bg-red-50 text-red-600 border-red-300"
                >
                    {slot.label}
                </div>
            );
        }

        /* ================= EDIT + ADD MODE (INTERACTIVE) ================= */
        let style = "";

        if (isSelected) {
            // 🔴 ACTIVE (BLOCKING)
            style = "bg-red-600 text-white border-red-600";
        } else if (slot.status === "available") {
            style = "bg-green-50 text-green-700 border-green-300 hover:bg-green-100";
        } else if (slot.status === "booked") {
            style =
                "bg-orange-50 text-orange-500 border-orange-300 cursor-not-allowed";
        } else {
            style =
                "bg-red-50 text-red-500 border-red-300 cursor-not-allowed";
        }

        return (
            <button
                key={slot.time}
                disabled={slot.status !== "available"}
                onClick={() => toggleSlot(slot)}
                className={`px-4 py-2 rounded-xl border text-sm transition
                  ${style}`}
            >
                {slot.label}
            </button>
        );
    };

    return (
        <div className="text-sm">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-semibold text-green-800">Turf Rentals</h1>
                    <p className="text-gray-500">
                        Manage turf rental bookings and schedules.
                    </p>
                </div>

                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-md"
                >
                    <Plus size={16} /> Add Turf Rental
                </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <Stat label="Total Rentals" value={total} />
                <Stat label="Confirmed" value={confirmed} />
                <Stat label="Pending" value={pending} />
                <Stat label="Total Revenue" value={`₹${revenue}`} />
            </div>

            {/* TABLE */}
            <div className="bg-white border rounded-lg overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600">
                        <tr className="text-left">
                            <th className="p-4 text-left">User Name</th>
                            <th className="p-4">Facility</th>
                            <th className="p-4">Sport</th>
                            <th className="p-4">Rental Date</th>
                            <th className="p-4">Start Time</th>
                            <th className="p-4">Duration</th>
                            <th className="p-4">Amount</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {rentals.map((r) => (
                            <tr key={r._id} className="border-t hover:bg-gray-50">
                                <td className="p-4">{r.userName}</td>
                                <td className="p-4">{r.facilityName}</td>
                                <td className="p-4">{r.sport}</td>
                                <td className="p-4">{r.rentalDate}</td>
                                <td className="p-4">{r.startTime}</td>
                                <td className="p-4">{r.durationHours} hrs</td>
                                <td className="p-4">₹{r.totalAmount}</td>
                                <td className="p-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-xs font-medium ${PAYMENT_STATUS_STYLES[r.paymentStatus]
                                            }`}
                                    >
                                        {r.paymentStatus}
                                    </span>
                                </td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() =>
                                            setMenu(menu === r._id ? null : r._id)
                                        }
                                    >
                                        <MoreVertical />
                                    </button>

                                    {menu === r._id && (
                                        <div
                                            ref={menuRef}
                                            className="absolute right-6 mt-2 w-32 bg-white border rounded-md shadow z-50"
                                        >
                                            <button
                                                onClick={() => {
                                                    openView(r);
                                                    setMenu(null);
                                                }}
                                                className="block w-full px-4 py-2 hover:bg-gray-100"
                                            >
                                                View
                                            </button>

                                            <button
                                                onClick={() => {
                                                    openEdit(r);
                                                    setMenu(null);
                                                }}
                                                className="block w-full px-4 py-2 hover:bg-gray-100"
                                            >
                                                Edit
                                            </button>

                                            <button
                                                onClick={() => {
                                                    deleteRental(r._id);
                                                    setMenu(null);
                                                }}
                                                className="block w-full px-4 py-2 text-red-600 hover:bg-gray-100"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    )}

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* RIGHT DRAWER */}
            {/* RIGHT SHEET */}
            <div className="fixed inset-0 z-50 pointer-events-none">
                {/* Overlay */}
                <div
                    onClick={closeDrawer}
                    className={`absolute inset-0 bg-black/40 transition-opacity duration-300
      ${isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0"}
    `}
                />

                {/* Drawer */}
                <div
                    className={`absolute right-0 top-0 h-full w-[420px] bg-white
      transform transition-transform duration-300 ease-out
      ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}
      pointer-events-auto
    `}
                >
                    <div className="h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h2 className="text-lg font-semibold">
                                {drawer === "add"
                                    ? "Add Turf Rental"
                                    : drawer === "edit"
                                        ? "Edit Turf Rental"
                                        : "View Turf Rental"}
                            </h2>
                            <button onClick={closeDrawer}>
                                <X />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 text-sm">
                            {/* User Name */}
                            <div>
                                <Label>User / Group Name</Label>
                                <Input
                                    disabled={drawer === "view"}
                                    value={drawer === "view" ? selected?.userName : form.userName}
                                    onChange={(e) =>
                                        setForm({ ...form, userName: e.target.value })
                                    }
                                />
                            </div>

                            {/* Phone */}
                            <div>
                                <Label>Phone</Label>
                                <Input
                                    disabled={drawer === "view"}
                                    value={drawer === "view" ? selected?.phone : form.phone}
                                    onChange={(e) =>
                                        setForm({ ...form, phone: e.target.value })
                                    }
                                />
                            </div>

                            {/* Facility + Sport */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Facility</Label>
                                    <Select
                                        disabled={drawer === "view"}
                                        value={form.facilityId}
                                        onValueChange={(facilityId) => {
                                            const facility = facilities.find(f => f._id === facilityId);

                                            setForm(prev => ({
                                                ...prev,
                                                facilityId,
                                                selectedSlots: [],
                                                totalAmount: 0,
                                            }));

                                            // 🔥 LOAD SLOTS IF DATE EXISTS
                                            if (form.rentalDate) {
                                                loadSlots(
                                                    facilityId,
                                                    format(form.rentalDate, "yyyy-MM-dd")
                                                );
                                            }

                                            setHourlyRate(facility?.hourlyRate || 0);
                                        }}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Facility" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {facilities.map((f) => (
                                                <SelectItem key={f._id} value={f._id}>
                                                    {f.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Sport</Label>
                                    <Select
                                        disabled={drawer === "view"}
                                        value={form.sport}
                                        onValueChange={(v) =>
                                            setForm({ ...form, sport: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Sport" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {sports.map((s) => (
                                                <SelectItem key={s._id} value={s.name}>
                                                    {s.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Date */}
                            {/* Rental Date */}
                            <div>
                                <Label>Rental Date</Label>

                                <Popover
                                    open={drawer === "add" ? dateOpen : false}
                                    onOpenChange={(open) => {
                                        if (drawer === "add") setDateOpen(open);
                                    }}
                                >
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="w-full justify-start text-left"
                                            disabled={drawer !== "add"}   // 🔒 DISABLE IN EDIT & VIEW
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.rentalDate
                                                ? format(form.rentalDate, "dd MMM yyyy")
                                                : "Pick a date"}
                                        </Button>
                                    </PopoverTrigger>

                                    {drawer === "add" && (
                                        <PopoverContent className="p-0">
                                            <Calendar
                                                mode="single"
                                                selected={form.rentalDate}
                                                onSelect={(d) => {
                                                    if (!d) return;

                                                    setForm((prev) => ({
                                                        ...prev,
                                                        rentalDate: d,
                                                        selectedSlots: [],
                                                        totalAmount: 0,
                                                    }));

                                                    if (form.facilityId) {
                                                        loadSlots(form.facilityId, format(d, "yyyy-MM-dd"));
                                                    }

                                                    setDateOpen(false); // ✅ CLOSE CALENDAR AFTER SELECT
                                                }}
                                            />
                                        </PopoverContent>
                                    )}
                                </Popover>


                            </div>


                            {/* Start Time + Duration */}
                            <div className="grid grid-cols-1 gap-4">
                                {slots.length > 0 && (
                                    <div className="mt-6 border rounded-xl p-5 bg-gray-50">

                                        <h3 className="font-semibold text-green-700 mb-4">
                                            Available Slots
                                        </h3>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                            {/* ===== MORNING ===== */}
                                            <div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Morning (7 AM – 11 AM)
                                                </p>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {slots
                                                        .filter((s) => Number(s.time.slice(0, 2)) < 11)
                                                        .map(renderSlot)}
                                                </div>
                                            </div>

                                            {/* ===== EVENING ===== */}
                                            <div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Evening (2 PM – 9 PM)
                                                </p>

                                                <div className="grid grid-cols-2 gap-3">
                                                    {slots
                                                        .filter((s) => Number(s.time.slice(0, 2)) >= 14)
                                                        .map(renderSlot)}
                                                </div>
                                            </div>

                                        </div>

                                        {/* ===== SLOT LEGEND ===== */}
                                        <div className="flex gap-6 text-xs text-gray-600 mt-6">
                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded bg-green-400" />
                                                Available
                                            </span>

                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded bg-orange-400" />
                                                Booked
                                            </span>

                                            <span className="flex items-center gap-2">
                                                <span className="w-3 h-3 rounded bg-red-400" />
                                                Blocked
                                            </span>
                                        </div>
                                    </div>
                                )}

                            </div>

                            {/* Payment */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Payment Status</Label>
                                    <Select
                                        disabled={drawer === "view"}
                                        value={form.paymentStatus}
                                        onValueChange={(v) =>
                                            setForm({ ...form, paymentStatus: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="paid">Paid</SelectItem>
                                            <SelectItem value="pending">Pending</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Payment Method</Label>
                                    <Select
                                        disabled={drawer === "view"}
                                        value={form.paymentMode}
                                        onValueChange={(v) =>
                                            setForm({ ...form, paymentMode: v })
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="upi">UPI</SelectItem>
                                            <SelectItem value="razorpay">Razorpay</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Amount */}
                            <div>
                                <Label>Total Amount (₹)</Label>
                                <Input disabled value={form.totalAmount} />

                            </div>
                        </div>

                        {/* Footer */}
                        {drawer !== "view" && (
                            <div className="p-6 border-t">
                                <Button
                                    className="w-full bg-green-700 hover:bg-green-800"
                                    onClick={saveRental}
                                >
                                    {drawer === "add" ? "Add Rental" : "Save Changes"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

        </div>
    );
}

/* ================= SMALL COMPONENT ================= */
function Stat({ label, value }) {
    return (
        <div className="bg-white border rounded-lg p-4">
            <div className="text-xl font-semibold text-green-700">{value}</div>
            <div className="text-gray-500">{label}</div>
        </div>
    );
}
