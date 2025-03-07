import { Outlet } from "react-router";
import Footer from "../components/Basic/Footer";
import Header from "../components/Basic/Header";
const MainLayout = () => {
return(
    <>
    <Header/>
    <div className="container">
        <Outlet/>

    </div>
    {/*<Footer/>*/}
    </>
)
}
export default MainLayout;
