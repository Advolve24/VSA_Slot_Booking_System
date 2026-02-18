import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnrollmentsLayout() {
  const navigate = useNavigate();

  return (
    <div className=" flex flex-col overflow-hidden px-0 sm:px-2 py-4">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 ">
        
        {/* Left Section */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-green-800">
            Enrollment Management
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage student enrollments, coaching batches.
          </p>
        </div>

      </div>

      {/* CONTENT */}
      <div className="flex-1  pt-4">
        <Outlet />
      </div>
    </div>
  );
}
