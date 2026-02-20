import { useEffect, useState, useMemo } from "react";
import api from "@/lib/axios";
import { Plus, MoreVertical, SlidersHorizontal, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

const ROLE_STYLES = {
  admin: "bg-purple-100 text-purple-700",
  player: "bg-green-100 text-green-700",
  staff: "bg-blue-100 text-blue-700",
};

export default function AdminUsers() {
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 5;

  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [menu, setMenu] = useState(null);
  const [drawer, setDrawer] = useState(null);
  const [selected, setSelected] = useState(null);

  const [filters, setFilters] = useState({ role: "all" });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const loadUsers = async () => {
    const res = await api.get("/users/all");
    setUsers(res.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  /* ================= FILTER ================= */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (filters.role !== "all" && u.role !== filters.role) return false;
      return true;
    });
  }, [users, filters]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredUsers, page]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const deleteUser = async (id) => {
    if (!confirm("Delete this user?")) return;
    await api.delete(`/users/${id}`);
    toast({ title: "User deleted" });
    loadUsers();
  };

  /* ================= STATS ================= */
  const total = users.length;
  const players = users.filter((u) => u.role === "player").length;
  const admins = users.filter((u) => u.role === "admin").length;
  const staff = users.filter((u) => u.role === "staff").length;

  return (
    <div className="text-sm">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 mb-4 mt-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-green-800">
            Users
          </h1>
          <p className="text-gray-500">
            Manage all registered users.
          </p>
        </div>
      </div>


        {/* TABLE */}
        <div className="bg-white border rounded-lg overflow-visible mt-4">

          {/* DESKTOP TABLE */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-600">
                <tr className="text-left">
                  <th className="p-4 text-left">Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>

              <tbody>
                {paginatedUsers.map((u) => (
                  <tr key={u._id} className="border-t hover:bg-gray-50">
                    <td className="p-4">{u.fullName}</td>
                    <td>{u.email || "—"}</td>
                    <td>{u.mobile || "—"}</td>
                    <td>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ROLE_STYLES[u.role]}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 text-right relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setMenu(menu === u._id ? null : u._id);
                        }}
                      >
                        <MoreVertical />
                      </button>

                      {menu === u._id && (
                        <div className="absolute right-0 mt-0 w-40 bg-white border rounded-md shadow z-[60]">
                          <button
                            onClick={() => {
                              setSelected(u);
                              setDrawer("view");
                              setMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            View
                          </button>

                          <button
                            onClick={() => {
                              setSelected(u);
                              setDrawer("edit");
                              setMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => {
                              deleteUser(u._id);
                              setMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
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

          {/* MOBILE CARDS */}
          <div className="md:hidden divide-y">
            {paginatedUsers.map((u) => (
              <div key={u._id} className="p-4 space-y-3">

                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-semibold">
                      {u.fullName}
                    </div>
                    <div className="text-xs text-gray-500">
                      {u.email}
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${ROLE_STYLES[u.role]}`}>
                    {u.role}
                  </span>
                </div>

                <div className="text-sm text-gray-600">
                  {u.mobile || "No phone"}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setMenu(menu === u._id ? null : u._id)}
                  >
                    <MoreVertical size={18} />
                  </button>
                </div>

                {menu === u._id && (
                  <div className="mt-2 w-full bg-white border rounded-md shadow">
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      View
                    </button>
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Edit
                    </button>
                    <button
                      onClick={() => deleteUser(u._id)}
                      className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 bg-white">
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        )}

      {/* MOBILE FILTER SHEET */}
      <Sheet open={mobileFilterOpen} onOpenChange={setMobileFilterOpen}>
        <SheetContent side="bottom" className="h-[40vh] rounded-t-2xl p-4">
          <SheetHeader>
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>

          <Select
            value={tempFilters.role}
            onValueChange={(v) =>
              setTempFilters((p) => ({ ...p, role: v }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="player">Player</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                setTempFilters({ role: "all" })
              }
            >
              Clear
            </Button>

            <Button
              className="flex-1 bg-green-700"
              onClick={() => {
                setFilters(tempFilters);
                setMobileFilterOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

