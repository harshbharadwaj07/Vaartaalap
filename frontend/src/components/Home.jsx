import React from "react";
import { NavLink } from "react-router-dom";
import Button from "react-bootstrap/Button";
function Home(){
    return(
        <div id="center" className="d-flex align-items-center justify-content-center" style={{width:"100%"}}>
            <div>
            <h1 className="pt-5">WELCOME</h1>
            <h2>Online Chatting is fun</h2>
            <img src="logo.png" style={{width:"25vw",height:"25vw",margin:"10px"}}/>
            <br/>
            <ul className="list-group list-group-horizontal d-flex align-items-center justify-content-around" type="none">
            <li className="nav-item">
            <NavLink className="nav-link" to="/signin"><Button className="btn btn-sm btn-warning" style={{padding:"5px",fontSize:"1.25rem"}}>Login</Button></NavLink>
            </li>
            <li className="nav-item">
            <NavLink className="nav-link" to="/signup"><Button className="btn btn-sm btn-success" style={{padding:"5px",fontSize:"1.25rem"}}>Register</Button></NavLink>
            </li>
            </ul>
            </div>
        </div>
    )
}
export default Home;