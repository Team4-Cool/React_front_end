import axios from "axios";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AccountInfoPage = () => {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState({
    username: "",
    email: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(userData);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await axios.get("http://127.0.0.1:8000/auth/user/", {
          headers: { Authorization: `Token ${token}` },
        });
        setUserData(response.data);
        setFormData(response.data); 
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    try {
      await axios.put("http://127.0.0.1:8000/auth/user/", formData, {
        headers: { Authorization: `Token ${token}` },
      });
      setUserData(formData); 
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };


  if (!userData.username) return <p>Loading...</p>;

  return (
    <div className="container mt-4">
      <h2>Account Information</h2>
      {isEditing ? (
        <div>
          <div className="mb-3">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              name="username" 
              value={formData.username} 
              onChange={handleInputChange} 
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="form-control" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange} 
            />
          </div>
          <button className="btn btn-success me-2" onClick={handleUpdate}>Save</button>
          <button className="btn btn-secondary" onClick={() => setIsEditing(false)}>Cancel</button>
        </div>
      ) : (
        <ul className="list-group">
          <li className="list-group-item"><strong>Username:</strong> {userData.username}</li>
          <li className="list-group-item"><strong>Email:</strong> {userData.email}</li>
        </ul>
      )}

      <div className="mt-3">
        {!isEditing && <button className="btn btn-primary me-2" onClick={() => setIsEditing(true)}>Edit</button>}
      </div>
    </div>
  );
};

export default AccountInfoPage;
