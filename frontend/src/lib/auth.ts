import { api } from "./api";

export async function login(username: string, password: string) {
  const { data } = await api.post("/token/", { username, password });
  localStorage.setItem("access", data.access);
  localStorage.setItem("refresh", data.refresh);
}

export function logout() {
  localStorage.removeItem("access");
  localStorage.removeItem("refresh");
  window.location.href = "/login";
}

export function isLoggedIn() {
  return !!localStorage.getItem("access");
}
