import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import the Auth context

import LoginFormPage from './pages/LoginPage';
import StartNoLoginPage from './pages/StartNoLoginPage';
import RegisterForm from './pages/registerPage';

import MainLayout from './Layouts/MainLayout';
import Home from './pages/home';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import "./App.css";
import BoardView from "./pages/BoardPage.jsx";

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

const AppRoutes = () => {
    const { user } = useAuth();  // Get the user from context

    return (
        <Routes>
            <Route path="/start" element={!user ? <StartNoLoginPage /> : <Navigate to="/home" />} />
            <Route path="/register" element={!user ? <RegisterForm /> : <Navigate to="/home" />} />
            <Route path="/login" element={!user ? <LoginFormPage /> : <Navigate to="/home" />} />
            <Route path="/" element={user ? <Navigate to="/home" /> : <Navigate to="/start" />} />
            {/* Protect the home page and main layout */}
            <Route path="/" element={user ? <MainLayout /> : <Navigate to="/start" />}>
                <Route path="/home" element={user ? <Home /> : <Navigate to="/start" />} />
                <Route path="/boards/:id" element={user ? <BoardView /> : <Navigate to="/start" />} />
            </Route>
        </Routes>
    );
};

export default App;
