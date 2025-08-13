import { useMemo } from "react";
import { formatISO, startOfWeek, endOfWeek } from "date-fns";
import { CourseProgress } from "@/components/CourseProgress";
import { LectureSection } from "@/components/LectureSection";
import { useDashboard } from "@/hooks/use-dashboard";
import type { LectureAPI } from "@/types/api";

type UILecture = {
  id: string;
  title: string;
  course: string;
  datetime: Date;
  location: string;
  status: "upcoming" | "missed" | "attended" | "summarized" | "needs-notes";
};

export default function Dashboard() {
  const { data, isLoading, isError } = useDashboard();

  //Load sections based on user's lecture objects
  const sections = useMemo(() => {
    const upcoming: UILecture[] = [];
    const missed: UILecture[] = [];
    const needsNotes: UILecture[] = []; //derived: backend 'attended' = attended but no summary
    if (!data) return { upcoming, missed, needsNotes };

    const allLectures: LectureAPI[] = data.courses.flatMap(c => c.lectures);
    for (const l of allLectures) {
      const ui: UILecture = {
        id: l.id,
        title: "Lecture", //backend has no 'title'; keep simple
        course: l.course_name,
        datetime: new Date(l.start_dt),
        location: l.location,
        status:
          l.status === "attended" ? "needs-notes" : //map 'attended' -> 'needs-notes' for UI
          (l.status as UILecture["status"]),
      };
      if (ui.status === "upcoming") upcoming.push(ui);
      else if (ui.status === "missed") missed.push(ui);
      else if (ui.status === "needs-notes") needsNotes.push(ui);
      //'summarized' will show under "Needs Notes", tbd if we add a section for summaries if desired
    }

    //Basic sort: nearest first
    const byTime = (a: UILecture, b: UILecture) => a.datetime.getTime() - b.datetime.getTime();
    upcoming.sort(byTime); missed.sort(byTime); needsNotes.sort(byTime);
    return { upcoming, missed, needsNotes };
  }, [data]);

  //Load course progress
  const courseProgress = useMemo(() => {
    if (!data) return [];
    return data.courses.map(c => {
      const total = c.lectures.length;
      const attendedCount = c.lectures.filter(l => l.status === "attended" || l.status === "summarized").length;
      return {
        id: c.id,
        name: c.name,
        code: c.name, //reuse name for now
        attendedLectures: attendedCount,
        totalLectures: total,
        color: c.color_hex,
      };
    });
  }, [data]);

  if (isLoading) {
    return <div className="space-y-8">
      <div className="h-24 rounded-lg bg-muted animate-pulse" />
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
        <div className="h-64 rounded-lg bg-muted animate-pulse" />
      </div>
    </div>;
  }

  if (isError || !data) {
    return <div className="text-sm text-destructive">Failed to load dashboard.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Course Progress Section */}
      <CourseProgress courses={courseProgress} />

      {/* Lecture Sections */}
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <LectureSection
          title="Upcoming Lectures"
          lectures={sections.upcoming}
          onViewDetails={(lec) => console.log("view", lec)}
          emptyMessage="No upcoming lectures"
        />
        <LectureSection
          title="Missed Lectures"
          lectures={sections.missed}
          onViewDetails={(lec) => console.log("view", lec)}
          emptyMessage="No missed lectures"
        />
        <LectureSection
          title="Needs Notes Upload"
          lectures={sections.needsNotes}
          onViewDetails={(lec) => console.log("view", lec)}
          emptyMessage="All caught up 🎉"
        />
      </div>
    </div>
  );
}
