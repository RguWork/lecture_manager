import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import clsx from "clsx";

type Mode = "responsive" | "initial-only";

type SmartBadgeProps = {
  label: string;                  // e.g., "Attended"
  colorClass?: string;            // e.g., "bg-success/10 text-success"
  dotColor?: string;              // e.g., "bg-success" (used in responsive xs)
  className?: string;
  mode?: Mode;                    // "responsive" (default) | "initial-only"
};

export default function SmartBadge({
  label,
  colorClass = "bg-muted/50 text-foreground",
  dotColor = "bg-foreground/60",
  className,
  mode = "responsive",
}: SmartBadgeProps) {
  const initial = label?.[0]?.toUpperCase() ?? "";

  if (mode === "initial-only") {
    // Always render a small circular badge with just the initial
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={clsx(
              "flex items-center justify-center h-5 w-5 rounded-full p-0 text-[10px] font-bold",
              colorClass,
              className
            )}
          >
            {initial}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top">{label}</TooltipContent>
      </Tooltip>
    );
  }

  // Responsive: md+ full text, sm initial, xs dot
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="inline-flex items-center gap-1">
          {/* Full text on md+ */}
          <Badge className={clsx("hidden md:inline", colorClass, className)}>
            {label}
          </Badge>

          {/* Single letter on sm */}
          <span
            className={clsx(
              "hidden sm:inline-flex md:hidden items-center justify-center rounded-full",
              "h-5 w-5 text-[10px] font-medium",
              colorClass,
              className
            )}
            aria-label={label}
          >
            {initial}
          </span>

          {/* Dot on xs */}
          <span
            className={clsx("inline sm:hidden h-2 w-2 rounded-full", dotColor)}
            aria-label={label}
          />
        </div>
      </TooltipTrigger>
      {/* Only need tooltip when compact (md hidden) */}
      <TooltipContent className="md:hidden" side="top">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
