import image from "../static/taskboard.png"
export default function StartNoLoginPage(){
    return(
       <div className="container">

        <img src={image} className="info-image"></img>
        <h1>TaskBoard</h1>
            <div className="btn-container md-3">
                <button type="button" className="btn btn-info">Login</button>
                <button type="button" className="btn btn-info">Register</button>
            </div>
       </div>
    )
}