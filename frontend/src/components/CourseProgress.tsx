import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";

interface Course {
  id: string;
  name: string;
  code: string;
  attendedLectures: number;
  totalLectures: number;
  color: string;
}

interface CourseProgressProps {
  courses: Course[];
}

export function CourseProgress({ courses }: CourseProgressProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-foreground">Course Progress</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const percentage = Math.round((course.attendedLectures / course.totalLectures) * 100);
          
          return (
            <Card key={course.id} className="p-4 hover:shadow-lg transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-foreground">{course.code}</h3>
                    <p className="text-sm text-muted-foreground">{course.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-primary">{percentage}%</span>
                    <p className="text-xs text-muted-foreground">
                      {course.attendedLectures}/{course.totalLectures} attended
                    </p>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className="h-2"
                  style={{ 
                    '--progress-background': course.color 
                  } as React.CSSProperties}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}