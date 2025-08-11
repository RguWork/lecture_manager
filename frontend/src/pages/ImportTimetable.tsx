import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const courses = [
  { value: "cs601", label: "CS 601 - Computer Science Fundamentals" },
  { value: "cs705", label: "CS 705 - Advanced Algorithms" },
  { value: "cs820", label: "CS 820 - Machine Learning" },
  { value: "cs650", label: "CS 650 - Database Systems" },
];

const weekdays = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

export default function ImportTimetable() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    course: "",
    weekday: "",
    startTime: "",
    endTime: "",
    startDate: "",
    endDate: "",
    location: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.course || !formData.weekday || !formData.startTime || !formData.endTime || !formData.startDate || !formData.endDate || !formData.location) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Simulate successful import
    toast({
      title: "Timetable Imported",
      description: `Successfully added ${formData.course} to your schedule.`,
    });

    // Reset form
    setFormData({
      course: "",
      weekday: "",
      startTime: "",
      endTime: "",
      startDate: "",
      endDate: "",
      location: "",
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2 animate-fade-in" style={{ animationDelay: '0.1s', animationFillMode: 'both' }}>
        <h1 className="text-2xl font-bold text-foreground">Import Timetable</h1>
        <p className="text-muted-foreground">Add a new recurring lecture to your schedule</p>
      </div>

      <div className="animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="course" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Course Name
            </Label>
            <Select value={formData.course} onValueChange={(value) => setFormData({ ...formData, course: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.value} value={course.value}>
                    {course.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Weekday Selection */}
          <div className="space-y-2">
            <Label htmlFor="weekday" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Weekday
            </Label>
            <Select value={formData.weekday} onValueChange={(value) => setFormData({ ...formData, weekday: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a weekday" />
              </SelectTrigger>
              <SelectContent>
                {weekdays.map((day) => (
                  <SelectItem key={day.value} value={day.value}>
                    {day.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            <Input
              id="location"
              type="text"
              placeholder="e.g., Room 120, Lab 301"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <Button type="submit" className="w-full">
            Import Timetable
          </Button>
        </form>
      </Card>
      </div>

      {/* Help Section */}
      <div className="animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        <Card className="p-4 bg-primary/5 border-primary/20">
        <h3 className="font-medium text-primary mb-2">Import Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• This will create recurring lectures for the specified date range</li>
          <li>• Make sure to select the correct course and time slots</li>
          <li>• You can always edit individual lectures later in the weekly schedule</li>
        </ul>
      </Card>
      </div>
    </div>
  );
}