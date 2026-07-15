import axios from "axios";

const api = axios.create({
  baseURL: "https://quizapp-hzh1.onrender.com/api",
});

console.log("BASE URL =", api.defaults.baseURL);

api.interceptors.request.use((config) => {
  console.log("REQUEST:", config.baseURL + config.url);

  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;