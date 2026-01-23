// src/pages/booking/components/ParentPlayerForm.jsx
import { useBookingStore } from "@/store/bookingStore";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ParentPlayerForm() {
  const { bookingData, setBookingData } = useBookingStore();

  const updateField = (name, value) => {
    setBookingData({ ...bookingData, [name]: value });
  };

  return (
    <div className="space-y-4 bg-white p-5 border rounded-xl shadow-sm">
      <h3 className="font-semibold text-lg text-green-800">
        Enter Participant Details
      </h3>

      {/* Parent Name */}
      <div>
        <Label className="text-sm">Parent Name</Label>
        <Input
          placeholder="Enter parent name"
          className="mt-1"
          onChange={(e) => updateField("parentName", e.target.value)}
        />
      </div>

      {/* Mobile */}
      <div>
        <Label className="text-sm">Mobile Number</Label>
        <Input
          placeholder="Enter mobile"
          className="mt-1"
          onChange={(e) => updateField("mobile", e.target.value)}
        />
      </div>

      {/* Player Name */}
      <div>
        <Label className="text-sm">Player Name</Label>
        <Input
          placeholder="Enter player name"
          className="mt-1"
          onChange={(e) => updateField("playerName", e.target.value)}
        />
      </div>

      {/* Age */}
      <div>
        <Label className="text-sm">Age</Label>
        <Input
          placeholder="Player age"
          className="mt-1"
          onChange={(e) => updateField("age", e.target.value)}
        />
      </div>
    </div>
  );
}
