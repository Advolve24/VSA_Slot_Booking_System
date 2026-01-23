// src/pages/booking/components/FacilitySelector.jsx
import { useBookingStore } from "@/store/bookingStore";
import useFetch from "@/hooks/useFetch";
import { Card } from "@/components/ui/card";

export default function FacilitySelector() {
  const { sport, facility, setFacility } = useBookingStore();

  if (!sport) return null;

  const { data, loading } = useFetch(`/api/facilities?sport=${sport._id}`);

  if (loading) return <p>Loading facilities...</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-green-800">Choose a Facility</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data?.map((item) => (
          <Card
            key={item._id}
            onClick={() => setFacility(item)}
            className={`p-4 cursor-pointer border 
              ${facility?._id === item._id ? "border-green-600 bg-green-50" : ""}
            `}
          >
            <p className="font-medium">{item.name}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
