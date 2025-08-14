import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

type ToggleVars = { lectureId: string; attended: boolean };

//mirror backend status rules for optimistic UI
function computeStatus(lec: any, attended: boolean) {
  const now = new Date();
  const start = new Date(lec.start_dt ?? lec.startDt ?? lec.start);
  if (start > now) return "upcoming";
  if (lec.summary) return "summarized";
  return attended ? "attended" : "missed";
}

export function useToggleAttendance() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ lectureId, attended }: ToggleVars) => {
      const { data } = await api.post(`/lectures/${lectureId}/attendance/`, { attended });
      return data;
    },
    onMutate: async ({ lectureId, attended }) => {
      await qc.cancelQueries({ queryKey: ["lectures"] });
      const snapshots = qc.getQueriesData<any>({ queryKey: ["lectures"] }).map(([key, value]) => ({ key, value }));

      //optimistic patch across any ["lectures", ...] caches
      snapshots.forEach(({ key }) => {
        qc.setQueryData(key, (old: any) => {
          if (!old) return old;
          const patch = (lec: any) =>
            lec?.id === lectureId ? { ...lec, attended, status: computeStatus(lec, attended) } : lec;
          if (Array.isArray(old)) return old.map(patch);
          if (Array.isArray(old?.results)) return { ...old, results: old.results.map(patch) };
          return old;
        });
      });

      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(({ key, value }: any) => qc.setQueryData(key, value));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["lectures"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
