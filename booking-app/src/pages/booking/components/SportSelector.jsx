// src/pages/booking/components/SportSelector.jsx
import { useBookingStore } from "@/store/bookingStore";
import useFetch from "@/hooks/useFetch";
import { Card } from "@/components/ui/card";

export default function SportSelector() {
  const { sport, setSport, reset } = useBookingStore();
  const { data, loading } = useFetch("/api/sports");

  if (loading) return <p>Loading sports...</p>;

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold text-green-800">Choose a Sport</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {data?.map((item) => (
          <Card
            key={item._id}
            onClick={() => {
              reset();
              setSport(item);
            }}
            className={`p-4 cursor-pointer border 
              ${sport?._id === item._id ? "border-green-600 bg-green-50" : ""}
            `}
          >
            <p className="font-medium">{item.name}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
