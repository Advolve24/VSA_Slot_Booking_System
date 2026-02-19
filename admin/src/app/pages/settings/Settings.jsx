import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import { useEffect, useState } from "react";
import GeneralTab from "./GeneralTab";
import DiscountTab from "./DiscountTab";

export default function SettingsPage() {
  const [isMobile, setIsMobile] = useState(false);

  /* ================= RESPONSIVE CHECK ================= */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mt-4">

      {/* ================= HEADER ================= */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-green-800">
          Settings
        </h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">
          Manage academy settings, pricing, and preferences.
        </p>
      </div>

      {/* ================= TABS ================= */}
      <Tabs defaultValue="general" className="w-full">

        {/* MOBILE → Scrollable Tabs */}
        <div className="overflow-x-auto md:overflow-visible">
          <TabsList
            className={`
              bg-gray-100 p-2 rounded-lg
              flex
              ${isMobile ? "w-max min-w-70%" : "w-fit"}
            `}
          >
            <TabsTrigger
              value="general"
              className="whitespace-nowrap text-sm md:text-base"
            >
              General
            </TabsTrigger>

            <TabsTrigger
              value="discounts"
              className="whitespace-nowrap text-sm md:text-base"
            >
              Discounts
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ================= TAB CONTENT ================= */}
        <TabsContent
          value="general"
          className="mt-4 md:mt-6"
        >
            <GeneralTab />
        </TabsContent>

        <TabsContent
          value="discounts"
          className="mt-4 md:mt-6"
        >
            <DiscountTab />
        </TabsContent>

      </Tabs>
    </div>
  );
}
