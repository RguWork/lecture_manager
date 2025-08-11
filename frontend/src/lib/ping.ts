import api from "./api";
export async function ping() {
  const { data } = await api.get("/ping/");
  return data; // { ok: true }
}
