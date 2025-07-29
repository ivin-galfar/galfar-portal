export const REACT_SERVER_URL =
  window.location.origin === "http://localhost:5173"
    ? import.meta.env.VITE_REACT_SERVER_URL
    : "https://galfar-scm-backend.onrender.com/";
