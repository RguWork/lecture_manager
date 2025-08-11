import { useState } from "react";
import { CourseProgress } from "@/components/CourseProgress";
import { LectureSection } from "@/components/LectureSection";

// Mock data
const mockCourses = [
  { id: "1", name: "Computer Science Fundamentals", code: "CS 601", attendedLectures: 15, totalLectures: 20, color: "hsl(217 91% 60%)" },
  { id: "2", name: "Advanced Algorithms", code: "CS 705", attendedLectures: 8, totalLectures: 12, color: "hsl(159 84% 39%)" },
  { id: "3", name: "Machine Learning", code: "CS 820", attendedLectures: 6, totalLectures: 15, color: "hsl(262 83% 70%)" },
  { id: "4", name: "Database Systems", code: "CS 650", attendedLectures: 12, totalLectures: 14, color: "hsl(25 95% 65%)" },
];

const mockLectures = {
  upcoming: [
    {
      id: "1",
      title: "Introduction to Neural Networks",
      course: "CS 820",
      datetime: new Date("2024-01-15T14:00:00"),
      location: "Room 205A",
      status: "upcoming" as const,
    },
    {
      id: "2",
      title: "Advanced SQL Queries",
      course: "CS 650",
      datetime: new Date("2024-01-16T10:00:00"),
      location: "Lab 301",
      status: "upcoming" as const,
    },
  ],
  missed: [
    {
      id: "3",
      title: "Graph Algorithms",
      course: "CS 705",
      datetime: new Date("2024-01-10T11:00:00"),
      location: "Room 150",
      status: "missed" as const,
    },
  ],
  needsNotes: [
    {
      id: "4",
      title: "Object-Oriented Programming",
      course: "CS 601",
      datetime: new Date("2024-01-08T13:00:00"),
      location: "Room 120",
      status: "needs-notes" as const,
    },
    {
      id: "5",
      title: "Data Structures Review",
      course: "CS 601",
      datetime: new Date("2024-01-09T09:00:00"),
      location: "Room 120",
      status: "needs-notes" as const,
    },
  ],
};

export default function Dashboard() {
  const [selectedLecture, setSelectedLecture] = useState(null);

  const handleViewDetails = (lecture: any) => {
    setSelectedLecture(lecture);
    console.log("View details for:", lecture);
  };

  return (
    <div className="space-y-8">
      {/* Course Progress Section */}
      <div className="animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <CourseProgress courses={mockCourses} />
      </div>

      {/* Lecture Sections */}
      <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <div className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
          <LectureSection
            title="Upcoming Lectures"
            lectures={mockLectures.upcoming}
            onViewDetails={handleViewDetails}
            emptyMessage="No upcoming lectures"
          />
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
          <LectureSection
            title="Missed Lectures"
            lectures={mockLectures.missed}
            onViewDetails={handleViewDetails}
            emptyMessage="No missed lectures"
          />
        </div>
        
        <div className="animate-fade-in" style={{ animationDelay: '0.4s', animationFillMode: 'both' }}>
          <LectureSection
            title="Needs Notes Upload"
            lectures={mockLectures.needsNotes}
            onViewDetails={handleViewDetails}
            emptyMessage="All lectures have notes"
          />
        </div>
      </div>
    </div>
  );
}