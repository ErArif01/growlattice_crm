import axios from "axios";

// Vite exposes env vars prefixed with VITE_ to the browser. Defaults to the
// backend's default port (5000) if VITE_API_URL isn't set in .env.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Attach the saved token to every outgoing request automatically, so
// individual components never have to remember to do this themselves.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("gl_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is ever invalid/expired, the backend returns 401 - catch that
// globally and send the user back to login instead of every page needing its own check.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("gl_token");
      localStorage.removeItem("gl_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
