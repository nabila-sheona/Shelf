import axios from "axios";

const fetchUserProfile = async () => {
  const token = localStorage.getItem("token"); // Retrieve token
  const res = await axios.get("http://localhost:4000/users/profile", {
    headers: { Authorization: `Bearer ${token}` }, // Send token in Authorization header
  });
  return res.data;
};

export default fetchUserProfile;
