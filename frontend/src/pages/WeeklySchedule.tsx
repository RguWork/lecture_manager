import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Upload, FileText, Brain, ChevronLeft, ChevronRight } from "lucide-react";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  isAfter,
  isBefore,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import SmartBadge from "@/components/SmartBadge";
import { useLectures } from "@/hooks/use-lectures";
import { useToggleAttendance } from "@/hooks/use-attendance";
import type { LectureAPI } from "@/types/api";

const weekDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); //8 AM to 7 PM
const HOUR_PX = 120;

type GridLecture = {
  id: string;
  course: string;
  title: string;
  day: number;        //0–6 (Sun..Sat)
  startTime: number;  //hour (0–23)
  endTime: number;    //hour (0–23), min +1
  location: string;
  attended: boolean;
  hasNotes: boolean;  //placeholder until S3 wiring
  hasSummary: boolean;
  rawStart: Date;
};

export default function WeeklySchedule() {
  const [selectedLecture, setSelectedLecture] = useState<GridLecture | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [search, setSearch] = useSearchParams();
  const weekParam = search.get("week"); //"YYYY-MM-DD"
  const focusId = search.get("focus"); //lecture id to highlight

  const toggleAttendance = useToggleAttendance();

  function localDate(yyyyMmDd: string) {
    const [y, m, d] = yyyyMmDd.split("-").map(Number);
    return new Date(y, m - 1, d);
  }

  const [currentWeek, setCurrentWeek] = useState<Date>(
    weekParam ? localDate(weekParam) : new Date()
  );

  //Week bounds (+-6 months)
  const minWeek = subMonths(new Date(), 6);
  const maxWeek = addMonths(new Date(), 6);

  const weekStart = startOfWeek(currentWeek);
  const weekEnd = endOfWeek(currentWeek);

  const from = format(weekStart, "yyyy-MM-dd");
  const to = format(weekEnd, "yyyy-MM-dd");

  //Live data
  const { data: lectures } = useLectures(from, to);

  //Map API -> grid-friendly items (keep UI shape the same as your previous mock)
  const gridLectures = useMemo<GridLecture[]>(() => {
    if (!lectures) return [];
    return lectures.map((l: LectureAPI) => {
      const start = new Date(l.start_dt);
      const end = new Date(l.end_dt);
      const startHour = start.getHours();
      const endHour = Math.max(startHour + 1, end.getHours()); //ensure at least 1 hour block
      return {
        id: l.id,
        course: l.course_name,
        title: "Lecture",
        day: getDay(start),
        startTime: startHour,
        endTime: endHour,
        location: l.location,
        attended: l.status === "attended" || l.status === "summarized",
        hasNotes: false, //TODO: wire soon
        hasSummary: l.status === "summarized",
        rawStart: start,
      };
    });
  }, [lectures]);

  //After lectures load, scroll and flash the target lecture
  useEffect(() => {
    if (!focusId) return;
    const el = document.getElementById(`lec-${focusId}`);
    if (el) {
      el.scrollIntoView({ block: "center", behavior: "smooth" });
      el.classList.add("ring-2", "ring-primary", "animate-pulse");
      const t = setTimeout(() => {
        el.classList.remove("ring-2", "ring-primary", "animate-pulse");
      }, 1600);
      return () => clearTimeout(t);
    }
  }, [focusId, lectures]);

  const handleLectureClick = (lecture: GridLecture) => {
    setSelectedLecture(lecture);
    setIsDrawerOpen(true);
  };

  const handleAttendanceToggle = (checked: boolean) => {
    if (!selectedLecture) return;
    //local feel
    setSelectedLecture({ ...selectedLecture, attended: checked });
    //persist
    toggleAttendance.mutate({ lectureId: String(selectedLecture.id), attended: checked });
  };

  const handleFileUpload = () => {
    if (selectedLecture) {
      setSelectedLecture({ ...selectedLecture, hasNotes: true });
    }
  };

  const generateSummary = () => {
    if (selectedLecture) {
      setSelectedLecture({ ...selectedLecture, hasSummary: true });
    }
  };

  const setWeekParam = (d: Date) => {
    const next = new URLSearchParams(search);
    next.set("week", format(d, "yyyy-MM-dd"));
    setSearch(next, { replace: true });
  };

  const navigateWeek = (direction: "prev" | "next") => {
    const newWeek = direction === "prev" ? subWeeks(currentWeek, 1) : addWeeks(currentWeek, 1);
    if (direction === "prev" && isBefore(startOfWeek(newWeek), startOfWeek(minWeek))) return;
    if (direction === "next" && isAfter(startOfWeek(newWeek), startOfWeek(maxWeek))) return;
    setCurrentWeek(newWeek);
    setWeekParam(newWeek); //keep URL in sync
  };

  const getLectureForSlot = (day: number, hour: number) => {
    return gridLectures.find((lecture) => lecture.day === day && hour >= lecture.startTime && hour < lecture.endTime);
  };

  const canNavigatePrev = !isBefore(startOfWeek(subWeeks(currentWeek, 1)), startOfWeek(minWeek));
  const canNavigateNext = !isAfter(startOfWeek(addWeeks(currentWeek, 1)), startOfWeek(maxWeek));

  return (
    <div className="space-y-6">
      <div
        className="flex items-center justify-between animate-fade-in"
        style={{ animationDelay: "0.1s", animationFillMode: "both" }}
      >
        <h1 className="text-2xl font-bold text-foreground">Weekly Schedule</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateWeek("prev")} disabled={!canNavigatePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <p className="text-muted-foreground min-w-[200px] text-center">
              {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
            </p>
            <Button variant="outline" size="sm" onClick={() => navigateWeek("next")} disabled={!canNavigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="animate-fade-in" style={{ animationDelay: "0.2s", animationFillMode: "both" }}>
        <Card className="p-6">
          <div className="overflow-x-auto">
            <div className="grid grid-cols-8 gap-2 min-w-[800px]">
              {/* Header Row */}
              <div className="font-medium text-center text-muted-foreground py-2">Time</div>
              {weekDays.map((day) => (
                <div key={day} className="font-medium text-center text-foreground py-2 border-b border-border">
                  {day}
                </div>
              ))}

              {/* Time Slots */}
              {timeSlots.map((hour) => (
                <div key={hour} className="contents">
                  {/* Time column: label on the notch (top border), doubled height */}
                  <div className="relative border-r border-border" style={{ height: HOUR_PX }}>
                    <div className="absolute top-0 right-2 -translate-y-4 text-xs text-muted-foreground">
                      {format(new Date().setHours(hour, 0, 0, 0), "h:mm a")}
                    </div>
                  </div>

                  {/* Day columns */}
                  {weekDays.map((_, dayIndex) => {
                    const lecture = getLectureForSlot(dayIndex, hour);
                    const isStart = !!lecture && hour === lecture.startTime;
                    const anchorId = isStart ? `lec-${lecture!.id}` : undefined;
                    return (
                      <div
                        key={`${dayIndex}-${hour}`}
                        className="relative border-r border-b border-border/50"
                        style={{ height: HOUR_PX }}
                      >
                        {lecture && hour === lecture.startTime && (
                          <Card
                            id = {anchorId}
                            className="absolute inset-x-1 -left-1 cursor-pointer hover:shadow-md transition-all z-10 bg-primary/5 border-primary/20"
                            style={{ height: lecture.endTime - lecture.startTime > 0 ? (lecture.endTime - lecture.startTime) * HOUR_PX - 8 : HOUR_PX - 8 }}
                            onClick={() => handleLectureClick(lecture)}
                          >
                            <div className="p-2 space-y-1 min-w-[90px]">
                              <div className="font-medium text-sm text-primary">{lecture.course}</div>
                              <div className="text-xs text-muted-foreground truncate">{lecture.title}</div>
                              <div className="text-xs text-muted-foreground">{lecture.location}</div>
                              <div className="flex flex-wrap gap-1">
                                {lecture.attended && (
                                  <SmartBadge
                                    label="Attended"
                                    colorClass="bg-success/10 text-success"
                                    mode="initial-only"
                                  />
                                )}
                                {lecture.hasNotes && (
                                  <SmartBadge
                                    label="Notes"
                                    colorClass="bg-primary/10 text-primary"
                                    mode="initial-only"
                                  />
                                )}
                                {lecture.hasSummary && (
                                  <SmartBadge
                                    label="Summary"
                                    colorClass="bg-secondary/50 text-secondary-foreground"
                                    mode="initial-only"
                                  />
                                )}
                              </div>
                            </div>
                          </Card>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Lecture Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          {selectedLecture && (
            <>
              <SheetHeader>
                <SheetTitle className="text-left">
                  {selectedLecture.course}: {selectedLecture.title}
                </SheetTitle>
              </SheetHeader>

              <div className="space-y-6 mt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Time:</span>{" "}
                    {format(new Date().setHours(selectedLecture.startTime, 0, 0, 0), "h:mm a")} -{" "}
                    {format(new Date().setHours(selectedLecture.endTime, 0, 0, 0), "h:mm a")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Location:</span> {selectedLecture.location}
                  </p>
                </div>

                {/* Attendance Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="attendance">Mark as Attended</Label>
                  <Switch id="attendance" checked={selectedLecture.attended} onCheckedChange={handleAttendanceToggle} />
                </div>

                {/* File Upload */}
                <div className="space-y-3">
                  <Label>Lecture Notes</Label>
                  {selectedLecture.hasNotes ? (
                    <div className="flex items-center gap-2 p-3 bg-success/10 rounded-lg">
                      <FileText className="h-4 w-4 text-success" />
                      <span className="text-sm text-success">Notes uploaded</span>
                    </div>
                  ) : (
                    <Button variant="outline" className="w-full" onClick={handleFileUpload}>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Notes
                    </Button>
                  )}
                </div>

                {/* AI Summary */}
                <div className="space-y-3">
                  <Label>AI Summary</Label>
                  {selectedLecture.hasSummary ? (
                    <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h4 className="font-medium mb-2">Lecture Summary</h4>
                      <p className="text-sm text-muted-foreground">
                        This lecture covered fundamental concepts in {selectedLecture.title.toLowerCase()}. Key topics included theoretical
                        foundations, practical applications, and problem-solving techniques. Students were introduced to core methodologies
                        and their real-world implementations.
                      </p>
                    </div>
                  ) : selectedLecture.hasNotes ? (
                    <Button variant="default" className="w-full" onClick={generateSummary}>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate AI Summary
                    </Button>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Upload notes first to generate summary</p>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
