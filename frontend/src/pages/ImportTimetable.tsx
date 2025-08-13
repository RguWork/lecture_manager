import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { addDays, format, isAfter, startOfWeek } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import { useImportTimetable } from "@/hooks/use-importtimetable";
import { localDateTimeToUtcISO } from "@/lib/datetime";
import type { ImportedLecture } from "@/api/import";

type Days = { sun: boolean; mon: boolean; tue: boolean; wed: boolean; thu: boolean; fri: boolean; sat: boolean };
const dayKeys: (keyof Days)[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const dayLabels: Record<keyof Days, string> = { sun: "Sun", mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat" };

const WEEKDAYS = {
  sun: "Sun",
  mon: "Mon",
  tue: "Tue",
  wed: "Wed",
  thu: "Thu",
  fri: "Fri",
  sat: "Sat",
} as const;
type DayKey = keyof typeof WEEKDAYS;

//parse "YYYY-MM-DD" as *local* (avoid UTC day-shift)
function localDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

//get UTC clock "HH:MM" for a local date+time (uses your helper)
function toUtcClockHHMM(dateStr: string, timeStr: string) {
  const iso = localDateTimeToUtcISO(dateStr, timeStr); // e.g. "2025-08-13T18:00:00.000Z"
  return iso.slice(11, 16); // "18:00"
}

export default function ImportTimetable() {
  const navigate = useNavigate();

  // simple local form state
  const [course, setCourse] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState<string>("");     // YYYY-MM-DD
  const [startTime, setStartTime] = useState<string>(""); // HH:mm
  const [endTime, setEndTime] = useState<string>("");     // HH:mm
  const [days, setDays] = useState<Days>({ sun: false, mon: false, tue: false, wed: false, thu: false, fri: false, sat: false });

  // wire your hook — it accepts a callback that receives the week ISO we should navigate to
  const { mutate: importTimetable, isPending } = useImportTimetable((weekISO) => {
    navigate(`/schedule?week=${weekISO}`);
  });

  // compute all dates in range that match selected days
  const datesInRange = useMemo(() => {
    if (!startDate || !endDate) return [];
    const start = localDate(startDate);
    const end = localDate(endDate);
    if (isAfter(start, end)) return [];

    const results: string[] = [];
    let cursor = new Date(start);
    while (!isAfter(cursor, end)) {
      const key = dayKeys[cursor.getDay()];
      if (days[key]) {
        results.push(format(cursor, "yyyy-MM-dd"));
      }
      cursor = addDays(cursor, 1);
    }
    return results;
  }, [startDate, endDate, days]);

  function toggleDay(k: keyof Days) {
    setDays((prev) => ({ ...prev, [k]: !prev[k] }));
  }

  function validate(): string | null {
    if (!startDate || !endDate) return "Please select start and end dates.";
    if (!startTime || !endTime) return "Please select start and end times.";
    if (isAfter(new Date(startDate), new Date(endDate))) return "Start date must be on or before end date.";
    if (!dayKeys.some((k) => days[k])) return "Please select at least one day of week.";
    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);
    if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) return "Invalid time format.";
    if (eh * 60 + em <= sh * 60 + sm) return "End time must be after start time.";
    return null;
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    // ensure we have at least one weekday selected
    const selectedKeys = (Object.keys(days) as DayKey[]).filter((k) => days[k]);
    if (selectedKeys.length === 0) {
      toast.error("Please select at least one day of week.");
      return;
    }

    // optional: keep your count preview based on datesInRange (now fixed with localDate)
    if (datesInRange.length === 0) {
      toast.error("No matching dates in the selected range.");
      return;
    }

    // Build one SLOT per selected weekday (what your backend expects)
    const slots = selectedKeys.map((k) => ({
      course: course || "",
      weekday: WEEKDAYS[k],                        // "Mon" | "Tue" | ...
      start_time: toUtcClockHHMM(startDate, startTime), // UTC clock "HH:MM"
      end_time:   toUtcClockHHMM(startDate, endTime),   // UTC clock "HH:MM"
      from_date: startDate,                        // "YYYY-MM-DD"
      to_date:   endDate,                          // "YYYY-MM-DD"
      location:  location || "",
    }));

    importTimetable(slots, {
      onError: (error: any) => {
        console.error("IMPORT ERROR", error?.response?.data ?? error);
        toast.error("Import failed.");
      },
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Import Timetable</h1>
      </div>

      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Course & Location (optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="course">Course (optional)</Label>
              <input
                id="course"
                type="text"
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="e.g., CS 601"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="location">Location (optional)</Label>
              <input
                id="location"
                type="text"
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                placeholder="Room 120"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {/* Date range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">Start date</Label>
              <input
                id="startDate"
                type="date"
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End date</Label>
              <input
                id="endDate"
                type="date"
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Days of week */}
          <div>
            <Label>Days of week</Label>
            <div className="mt-2 grid grid-cols-7 gap-2">
              {dayKeys.map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => toggleDay(k)}
                  className={[
                    "rounded-md px-2 py-2 text-sm border transition-colors",
                    days[k]
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-background border-border text-muted-foreground hover:bg-muted",
                  ].join(" ")}
                  aria-pressed={days[k]}
                >
                  {dayLabels[k]}
                </button>
              ))}
            </div>
          </div>

          {/* Time range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start time</Label>
              <input
                id="startTime"
                type="time"
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endTime">End time</Label>
              <input
                id="endTime"
                type="time"
                className="mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Your times are interpreted in your browser timezone and converted to UTC before saving.
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Importing…" : "Import"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {datesInRange.length > 0 ? `${datesInRange.length} occurrence(s) will be created.` : "No dates selected yet."}
            </span>
          </div>
        </form>
      </Card>
    </div>
  );
}
