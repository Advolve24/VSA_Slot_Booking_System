import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EnrollmentsLayout() {
  const navigate = useNavigate();

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between pb-4">
        <div>
          <h1 className="text-2xl font-bold text-green-800">
            Enrollment Management
          </h1>
          <p className="text-muted-foreground">
            Manage student enrollments, coaching batches.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(0)}
          className="flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}
