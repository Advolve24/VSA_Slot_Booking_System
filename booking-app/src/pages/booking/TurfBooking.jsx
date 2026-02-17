import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { format, isBefore, startOfDay } from "date-fns";

import api from "@/lib/axios";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

const ASSETS_BASE =
  import.meta.env.VITE_ASSETS_BASE_URL || "http://localhost:5000";

export default function TurfBooking() {
  const navigate = useNavigate();

  /* ================= DATA ================= */
  const [sports, setSports] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [slots, setSlots] = useState([]);

  /* ================= SELECTION ================= */
  const [sport, setSport] = useState(null);
  const [facilityId, setFacilityId] = useState("");
  const [date, setDate] = useState(null);
  const [selectedSlots, setSelectedSlots] = useState([]);

  /* ================= LOAD ================= */
  useEffect(() => {
    api.get("/sports").then((r) => setSports(r.data));
    api.get("/facilities").then((r) =>
      setFacilities(r.data.filter((f) => f.status === "active"))
    );
  }, []);

  /* ================= FILTER FACILITIES BY SPORT ================= */
  const supportedFacilities = useMemo(() => {
    if (!sport) return [];
    return facilities.filter((f) =>
      f.sports?.some((s) => s._id === sport._id)
    );
  }, [sport, facilities]);

  const selectedFacility = facilities.find((f) => f._id === facilityId);

  /* ================= LOAD SLOTS ================= */
  useEffect(() => {
    if (!facilityId || !date) return;

    api
      .get(
        `/facilities/${facilityId}/slots?date=${format(date, "yyyy-MM-dd")}`
      )
      .then((r) => {
        setSlots(r.data || []);
        setSelectedSlots([]);
      });
  }, [facilityId, date]);

  /* ================= SLOT TOGGLE ================= */
  const toggleSlot = (slot) => {
    if (slot.status !== "available") return;

    setSelectedSlots((prev) =>
      prev.includes(slot.time)
        ? prev.filter((t) => t !== slot.time)
        : [...prev, slot.time]
    );
  };

  /* ================= CONTINUE ================= */
  const handleContinue = () => {
    navigate("/book-turf/confirm", {
      state: {
        sportId: sport._id,
        sportImage: sport.iconUrl,
        sportName: sport.name,
        facilityId,
        facilityName: selectedFacility.name,
        date: format(date, "yyyy-MM-dd"),
        slots: slots.filter((s) => selectedSlots.includes(s.time)),
        hourlyRate: selectedFacility.hourlyRate,
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* ================= TITLE ================= */}
      <div>
        <h1 className="text-2xl font-bold text-green-800">
          Book Facility
        </h1>
        <p className="text-sm text-gray-600">
          Choose sport, facility, date and slots
        </p>
      </div>

      {/* ================= SPORT (IMAGE GRID) ================= */}
      <section>
        <h2 className="text-xl font-semibold text-green-800 mb-4">
          Select Sport
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {sports.map((s) => (
            <button
              key={s._id}
              onClick={() => {
                setSport(s);
                setFacilityId("");
                setDate(null);
                setSlots([]);
                setSelectedSlots([]);
              }}
              className={cn(
                "relative h-36 rounded-xl overflow-hidden transition",
                sport?._id === s._id
                  ? "ring-4 ring-green-700"
                  : "hover:ring-2 hover:ring-green-400"
              )}
            >
              <img
                src={`${ASSETS_BASE}${s.iconUrl}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-3 w-full text-center text-white font-semibold">
                {s.name}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ================= FACILITY + DATE (ONE ROW) ================= */}
      {sport && (
        <section>
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            Select Facility & Date
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* FACILITY DROPDOWN */}
            <div>
              <label className="text-sm font-medium">Facility</label>
              <Select
                value={facilityId}
                onValueChange={(v) => {
                  setFacilityId(v);
                  setDate(null);
                  setSlots([]);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Facility" />
                </SelectTrigger>
                <SelectContent>
                  {supportedFacilities.map((f) => (
                    <SelectItem key={f._id} value={f._id}>
                      {f.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* DATE PICKER */}
            <div>
              <label className="text-sm font-medium">Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    disabled={!facilityId}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd MMM yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(d) =>
                      isBefore(d, startOfDay(new Date()))
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </section>
      )}

      {/* ================= SLOTS ================= */}
      {slots.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-green-800 mb-4">
            Select Slots
          </h2>

          <div className="flex flex-wrap gap-3">
            {slots.map((slot) => (
              <button
                key={slot.time}
                onClick={() => toggleSlot(slot)}
                disabled={slot.status !== "available"}
                className={cn(
                  "px-4 py-2 rounded-lg border text-sm",
                  slot.status !== "available" &&
                    "opacity-40 cursor-not-allowed",
                  selectedSlots.includes(slot.time)
                    ? "bg-green-700 text-white"
                    : "border-green-600 bg-green-50 text-green-700"
                )}
              >
                {slot.label}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ================= CONTINUE ================= */}
      <Button
        disabled={!facilityId || !date || !selectedSlots.length}
        onClick={handleContinue}
        className="w-full bg-orange-500 hover:bg-orange-600 py-6 text-lg"
      >
        Continue
      </Button>
    </div>
  );
}
