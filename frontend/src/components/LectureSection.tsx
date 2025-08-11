import { LectureCard } from "./LectureCard";

interface Lecture {
  id: string;
  title: string;
  course: string;
  datetime: Date;
  location: string;
  status: "upcoming" | "missed" | "attended" | "summarized" | "needs-notes";
}

interface LectureSectionProps {
  title: string;
  lectures: Lecture[];
  onViewDetails: (lecture: Lecture) => void;
  emptyMessage?: string;
}

export function LectureSection({ title, lectures, onViewDetails, emptyMessage = "No lectures found" }: LectureSectionProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      {lectures.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {lectures.map((lecture) => (
            <LectureCard
              key={lecture.id}
              lecture={lecture}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}