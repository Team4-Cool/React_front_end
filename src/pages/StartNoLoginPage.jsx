import { Link } from "react-router-dom"
import image from "../static/taskboard.png"
export default function StartNoLoginPage(){
    return(
       <div className="container">

        <img src={image} className="info-image"></img>
        <h1>TaskBoard</h1>
            <div className="btn-container md-3">
                <Link to="/login" className="btn btn-info">Login</Link>
                <Link to="/register" className="btn btn-info">Register</Link>
            </div>
       </div>
    )
}