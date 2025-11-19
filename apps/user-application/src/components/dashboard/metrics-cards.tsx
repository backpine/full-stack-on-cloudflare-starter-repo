import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Activity, Link, Clock } from "lucide-react";
import { ReactNode } from "react";

interface MetricCardProps {
  title: string;
  icon: ReactNode;
  value: number | string;
  description: string;
  valueFormatted?: boolean;
  descriptionColor?: string;
}

function MetricCard({
  title,
  icon,
  value,
  description,
  valueFormatted = true,
  descriptionColor,
}: MetricCardProps) {
  return (
    <Card className="hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold">
          {valueFormatted && typeof value === "number"
            ? value.toLocaleString()
            : value}
        </div>
        <p className={`text-xs ${descriptionColor || "text-muted-foreground"}`}>
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

export function MetricsCards() {
  const { data: clicksLastHour } = useSuspenseQuery(
    trpc.links.totalLinkClickLastHour.queryOptions(undefined, {
      refetchInterval: 5000,
    }), // refetch every 5 seconds
  );
  const { data: clicksLast24Hours } = useSuspenseQuery(
    trpc.links.last24HourClicks.queryOptions(undefined, {
      refetchInterval: 5000,
    }), // refetch every 5 seconds
  );
  const { data: clicksLast30Days } = useSuspenseQuery(
    trpc.links.last30DaysClicks.queryOptions(undefined, {
      refetchInterval: 5000,
    }), // refetch every 5 seconds
  );

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <MetricCard
        title="Clicks in Last 30 Days"
        icon={<Link className="h-4 w-4 text-muted-foreground" />}
        value={clicksLast30Days}
        description="30 day range"
      />

      <MetricCard
        title="Clicks in Last 24 Hours"
        icon={<Activity className="h-4 w-4 text-muted-foreground" />}
        value={clicksLast24Hours.last24Hours}
        description={`${clicksLast24Hours.percentChange}% from yesterday`}
        descriptionColor={
          clicksLast24Hours.percentChange < 0
            ? "text-red-600 dark:text-red-400 font-medium"
            : "text-emerald-600 dark:text-emerald-400 font-medium"
        }
      />

      <MetricCard
        title="Clicks in Last 60 Minutes"
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
        value={clicksLastHour}
        description="Live activity"
      />
    </div>
  );
}
