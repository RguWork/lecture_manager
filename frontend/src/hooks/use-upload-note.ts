import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ensureMyAttendance, uploadNoteToAttendance } from "@/api/attendances";

type Vars = { lectureId: string; file: File };

//hook to upload notes for a lecture
export function useUploadNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ lectureId, file }: Vars) => {
      const att = await ensureMyAttendance(lectureId);
      return uploadNoteToAttendance(att.id, file);
    },
    onSuccess: () => {
      //refresh everything that might show status/badges/etc.
      qc.invalidateQueries({ queryKey: ["lectures"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["attendances"] });
    },
  });
}
