
import MainLayout from './Layouts/MainLayout'
import Home from './pages/home'
import { Routes, Route } from 'react-router'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
const App = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainLayout />} >
          <Route index element={<Home />} />
        </Route>
      </Routes>
    </>
  )
}

export default App;
