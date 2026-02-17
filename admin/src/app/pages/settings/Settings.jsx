import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

import GeneralTab from "./GeneralTab";
import DiscountTab from "./DiscountTab";

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-6xl">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold text-green-800">
          Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Manage academy settings, pricing, and preferences.
        </p>
      </div>

      {/* TABS */}
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-lg w-fit">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="discounts">Discounts</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralTab />
        </TabsContent>

        <TabsContent value="discounts" className="mt-6">
          <DiscountTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
