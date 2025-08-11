import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  // withCredentials: true, // enable later if you choose cookie-based auth
});

export default api;
