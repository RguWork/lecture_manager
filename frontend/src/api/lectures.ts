import { api } from "@/lib/api";
import { LectureAPI } from "@/types/api";


export async function fetchLectures(params: { from?: string; to?: string }): Promise<LectureAPI[]>{
    const {data} = await api.get<LectureAPI[]>("/lectures/", { params });
    return data;
}