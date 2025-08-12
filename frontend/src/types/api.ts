export type LectureStatus = "upcoming" | "missed" | "attended" | "summarized";

export interface LectureAPI {
  id: string;
  course: string; //UUID
  course_name: string;
  start_dt: string; //ISO 8601
  end_dt: string; //ISO 8601
  location: string;
  attended: boolean | null;
  status: LectureStatus;
}

export interface CourseDashboardAPI {
  id: string;
  name: string;
  color_hex: string;
  lectures: LectureAPI[];
  percentage: number;
}

export interface DashboardResponse {
  courses: CourseDashboardAPI[];
}
