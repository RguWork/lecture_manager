import { useQuery } from "@tanstack/react-query";
import { fetchLectures } from "@/api/lectures";

export function useLectures(from?: string, to?: string) {
  return useQuery({
    queryKey: ["lectures", { from, to }],
    queryFn: () => fetchLectures({ from, to }),
    enabled: !!from && !!to,  //only run when both are set
  });
}
