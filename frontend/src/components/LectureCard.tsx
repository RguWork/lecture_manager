import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Clock, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import SmartBadge from "@/components/SmartBadge";


interface Lecture {
  id: string;
  title: string;
  course: string;
  datetime: Date;
  location: string;
  status: "upcoming" | "missed" | "attended" | "summarized" | "needs-notes";
}

interface LectureCardProps {
  lecture: Lecture;
  onViewDetails: (lecture: Lecture) => void;
}

const statusConfig = {
  upcoming: { label: "Upcoming", variant: "secondary" as const, color: "bg-primary/10 text-primary" },
  missed: { label: "Missed", variant: "destructive" as const, color: "bg-danger/10 text-danger" },
  attended: { label: "Attended", variant: "default" as const, color: "bg-success/10 text-success" },
  summarized: { label: "Summarized", variant: "default" as const, color: "bg-academic-purple/10 text-academic-purple" },
  "needs-notes": { label: "Needs Notes", variant: "secondary" as const, color: "bg-warning/10 text-warning" },
};

export function LectureCard({ lecture, onViewDetails }: LectureCardProps) {
  const status = statusConfig[lecture.status];
  
  return (
    <Card className="p-4 hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-foreground">{lecture.course}</h3>
            <SmartBadge
              label={status.label}
              colorClass={status.color}
              dotColor={
                lecture.status === "attended" ? "bg-success" :
                lecture.status === "missed" ? "bg-danger" :
                lecture.status === "summarized" ? "bg-academic-purple" :
                lecture.status === "needs-notes" ? "bg-warning" :
                "bg-primary"
              }
            />
          </div>
          
          <p className="text-sm text-muted-foreground">{lecture.title}</p>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {format(lecture.datetime, "MMM dd, HH:mm")}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {lecture.location}
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewDetails(lecture)}
          className="ml-2"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}