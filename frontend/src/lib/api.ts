import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

function getAccess() { return localStorage.getItem("access"); }
function getRefresh() { return localStorage.getItem("refresh"); }

let isRefreshing = false;
let waiters: ((t: string|null) => void)[] = [];

api.interceptors.request.use((config) => {
  const token = getAccess();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const orig = error.config;
    if (error.response?.status === 401 && !orig._retry && getRefresh()) {
      orig._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const { data } = await axios.post(
            `${import.meta.env.VITE_API_URL}/token/refresh/`,
            { refresh: getRefresh() }
          );
          localStorage.setItem("access", data.access);
          waiters.forEach(w => w(data.access));
          waiters = [];
          return api(orig);
        } catch {
          waiters.forEach(w => w(null));
          waiters = [];
          localStorage.removeItem("access");
          localStorage.removeItem("refresh");
          window.location.href = "/login";
          return Promise.reject(error);
        } finally {
          isRefreshing = false;
        }
      }
      //queue while refresh in-flight
      return new Promise((resolve, reject) => {
        waiters.push((t) => {
          if (t) {
            orig.headers.Authorization = `Bearer ${t}`;
            resolve(api(orig));
          } else {
            reject(error);
          }
        });
      });
    }
    return Promise.reject(error);
  }
);
