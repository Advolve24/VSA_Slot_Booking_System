import { Card, CardContent } from "@/components/ui/card";

export default function RecentActivity({ activity }) {
  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold text-green-700 mb-4">
          Recent Activity
        </h2>

        {!activity?.length ? (
          <p className="text-sm text-muted-foreground">No recent activity</p>
        ) : (
          <ul className="space-y-4">
            {activity.map((item, i) => (
              <li key={i} className="flex gap-3">
                <span className="w-2.5 h-2.5 mt-2 rounded-full bg-green-600" />
                <div>
                  <p className="text-sm font-medium">{item.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
