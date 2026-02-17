import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GeneralTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    academyName: "",
    shortName: "",
    address: "",
    contactEmail: "",
    contactPhone: "",
    operatingHours: "",
    workingDays: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        if (res.data) setForm(res.data);
      } catch {
        toast({
          variant: "destructive",
          title: "Failed to load settings",
        });
      } finally {
        setFetching(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      await api.put("/settings", form);
      toast({ title: "Settings Updated ✅" });
    } catch {
      toast({
        variant: "destructive",
        title: "Update Failed",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div>Loading...</div>;

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm space-y-4">

      <div>
        <h2 className="text-xl font-semibold text-gray-800">
          Academy Information
        </h2>
        <p className="text-sm text-gray-500">
          Update your academy's basic information.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label>Academy Name</Label>
          <Input
            value={form.academyName}
            onChange={(e) =>
              setForm({ ...form, academyName: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Short Name</Label>
          <Input
            value={form.shortName}
            onChange={(e) =>
              setForm({ ...form, shortName: e.target.value })
            }
          />
        </div>
      </div>

      <div>
        <Label>Address</Label>
        <Textarea
          rows={3}
          value={form.address}
          onChange={(e) =>
            setForm({ ...form, address: e.target.value })
          }
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label>Contact Email</Label>
          <Input
            type="email"
            value={form.contactEmail}
            onChange={(e) =>
              setForm({ ...form, contactEmail: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Contact Phone</Label>
          <Input
            value={form.contactPhone}
            onChange={(e) =>
              setForm({ ...form, contactPhone: e.target.value })
            }
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <Label>Operating Hours</Label>
          <Input
            value={form.operatingHours}
            onChange={(e) =>
              setForm({ ...form, operatingHours: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Working Days</Label>
          <Input
            value={form.workingDays}
            onChange={(e) =>
              setForm({ ...form, workingDays: e.target.value })
            }
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={loading}
        className="bg-green-700"
      >
        <Save className="w-4 h-4 mr-2" />
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
}
