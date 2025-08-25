import { api } from "@/lib/api";

export type Attendance = {
  id: string;
  lecture: string;
  attended: boolean;
  note_upload?: string | null;
  summary?: string | null;
};

export async function getMyAttendanceForLecture(lectureId: string): Promise<Attendance | null> {
  const { data } = await api.get("/attendances/", {
    params: { lecture_id: lectureId },
  });

  //server may return plain [] or {results: []}
  const rows: Attendance[] = Array.isArray(data) ? data : data?.results ?? [];

  //extra safety: if the server didn't filter, pick the row that actually matches this lecture
  const match = rows.find((r) => r.lecture === lectureId);
  return match ?? rows[0] ?? null;
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
  console.log("Uploaded to attendance:", data.id, "note_upload:", data.note_upload);
  return data;
}
