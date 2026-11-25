import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Include cookies in requests
    timeout: 5000, // Set a timeout for requests (in milliseconds)
});
export default api;
