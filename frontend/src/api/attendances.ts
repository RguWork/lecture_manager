import { api } from "@/lib/api";

export type Attendance = {
  id: string;
  lecture: string;
  attended: boolean;
  note_upload?: string | null;
  summary?: string | null;
};

export async function getMyAttendanceForLecture(lectureId: string): Promise<Attendance | null> {
  const { data } = await api.get("/attendances/", { params: { lecture: lectureId } });
  const rows = Array.isArray(data) ? data : data?.results ?? [];
  return rows[0] ?? null;
}

export async function createMyAttendance(lectureId: string): Promise<Attendance> {
  const { data } = await api.post("/attendances/", { lecture: lectureId });
  return data;
}

export async function ensureMyAttendance(lectureId: string): Promise<Attendance> {
  const existing = await getMyAttendanceForLecture(lectureId);
  if (existing) return existing;
  return createMyAttendance(lectureId);
}

export async function uploadNoteToAttendance(attendanceId: string, file: File): Promise<Attendance> {
  const form = new FormData();
  form.append("note_upload", file);
  const { data } = await api.patch(`/attendances/${attendanceId}/`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
