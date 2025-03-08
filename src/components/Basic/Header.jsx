import { Link } from "react-router-dom"; // Correct import for React Router
import { useAuth } from "../../contexts/AuthContext"; // Import the AuthContext to get user data
import axios from 'axios';
import { useState, useEffect } from 'react'; // Import useState and useEffect

export default function Header() {
  const { user, logout } = useAuth(); // Use the context to access user info and logout method
  const [userData, setUserData] = useState(null); // State to hold the fetched user data
  
  const fetchUserData = async () => {
    const token = localStorage.getItem('token'); // Retrieve the token from localStorage
   
    if (!token) {
      console.log('No token found');
      return;
    }
  
    try {
      const response = await axios.get('http://127.0.0.1:8000/auth/user/', {
        headers: {
            Authorization: `Token ${token}` // Include the token in the Authorization header
        },
      });
  
      // If successful, store the user data in the state
      const { username, email, first_name, last_name } = response.data;
      setUserData({ username, email, first_name, last_name });
      console.log('User data:', { username, email, first_name, last_name });
    } catch (error) {
      console.error('Failed to fetch user data:', error.response || error.message);
    }
  };
  
  // Use useEffect to fetch user data when the component mounts
  useEffect(() => {
    fetchUserData();
  }, []); // Empty array means this effect runs only once after the initial render
  
  return (
    <header data-bs-theme="dark">
      <nav className="navbar navbar-expand-md navbar-dark fixed-top bg-dark">
        <div className="container">
          <Link className={'navbar-brand'} to={"/"}>KanBan</Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarCollapse"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarCollapse">
            <ul className="navbar-nav me-auto mb-2 mb-md-0">
              <li className="nav-item">
                <Link className="nav-link active" aria-current="page" to={"/"}>Home</Link>
              </li>

              <li className="nav-item">
                <Link className="nav-link disabled" aria-disabled="true" to={"#"}>Disabled</Link>
              </li>
            </ul>

            <ul className="navbar-nav">
              {user || userData ? (
                // If the user is logged in, show welcome message and user data
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/account">
                      Welcome, {userData ? userData.username : user.email}
                    </Link>
                  </li>
                  <li className="nav-item">
                    <button
                      className="nav-link btn btn-link"
                      onClick={logout} // Logout function
                    >
                      Log Out
                    </button>
                  </li>
                </>
              ) : (
                // If the user is not logged in, show Log In and Register options
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Log In</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">Register</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}
