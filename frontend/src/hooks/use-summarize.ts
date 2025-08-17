import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ensureMyAttendance } from "@/api/attendances";
import { summarizeAttendance } from "@/api/summarize";

export function useSummarizeAttendance() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ lectureId }: { lectureId: string }) => {
            const attendance = await ensureMyAttendance(lectureId);
            return summarizeAttendance(attendance.id);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["lectures"] });
            qc.invalidateQueries({ queryKey: ["dashboard"] });
            qc.invalidateQueries({ queryKey: ["attendances"] });
        }
    });
}