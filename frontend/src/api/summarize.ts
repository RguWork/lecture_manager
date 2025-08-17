import { api } from "@/lib/api";

export async function summarizeAttendance(attendanceId: string): Promise<{summary: string}> {
    const {data} = await api.post(`/summarize/`, { attendance_id: attendanceId });
    return data as { summary: string };
}