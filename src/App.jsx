
import MainLayout from './Layouts/MainLayout'
import Home from './pages/home'
import { Routes, Route } from 'react-router'

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './App.css'
import StartNoLoginPage from './pages/StartNoLoginPage';
import RegisterForm from './pages/registerPage';
import LoginFormPage from './pages/LoginPage';
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />} >
          <Route index element={<Home />} />
        </Route>
        <Route path='/start' element={<StartNoLoginPage/> }/>
        <Route path='/register' element={<RegisterForm/>}/>
        <Route path='/login' element={<LoginFormPage/>}/>
      </Routes>
    </>
  )
}

export default App;
