import axios from "axios";

const newRequest = axios.create({
  baseURL: "http://localhost:4000/api", // Adjust the base URL according to your backend
  withCredentials: true,
});

export default newRequest;
