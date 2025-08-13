import { api } from "@/lib/api";

export type ImportedLecture = {
  course: string;
  start_dt: string; //ISO string in UTC, e.g. "2025-08-12T18:00:00.000Z"
  end_dt: string; // ISO string in UTC
  location?: string;
};

export async function importTimetable(lectures: ImportedLecture[]) {
  const { data } = await api.post("/schedule/import/", { lectures });
  return data;
}
