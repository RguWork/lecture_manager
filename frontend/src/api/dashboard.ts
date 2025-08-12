import { api } from "@/lib/api";
import { DashboardResponse } from "@/types/api";

export async function fetchDashboard(): Promise<DashboardResponse> {
  const { data } = await api.get("/dashboard/");
  return data;
}