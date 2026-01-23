import { Card, CardContent } from "@/components/ui/card";

export default function Charts() {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-1">Activity Overview</h2>
        <p className="text-sm text-muted-foreground">
          Charts will appear here (dynamic).
        </p>
      </CardContent>
    </Card>
  );
}
