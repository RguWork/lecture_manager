import { useMutation, useQueryClient } from "@tanstack/react-query";
import { importTimetable, ImportedLecture } from "@/api/import";
import { startOfWeek, format } from "date-fns";

export function useImportTimetable(onDone?: (weekISO: string) => void) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (lectures: ImportedLecture[]) => importTimetable(lectures),
    onSuccess: (res) => {
      //try to infer the week to navigate to
      let firstISO: string | undefined = res?.first_lecture_dt;
      if (!firstISO && Array.isArray(res) && res[0]?.start_dt) {
        firstISO = res[0].start_dt;
      }

      if (firstISO) {
        const week = format(startOfWeek(new Date(firstISO)), "yyyy-MM-dd");
        onDone?.(week);
      } else {
        onDone?.(format(startOfWeek(new Date()), "yyyy-MM-dd"));
      }

      //refresh schedule-related queries
      qc.invalidateQueries({ queryKey: ["lectures"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
