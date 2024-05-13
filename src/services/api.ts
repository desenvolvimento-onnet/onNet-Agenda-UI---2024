import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3333",
  //baseURL: "http://177.85.0.28:9000",
});

export default api;
