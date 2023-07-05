import React,{useState,useContext} from "react";
import { useNavigate,NavLink } from "react-router-dom";
import Alert from "./Alert";
import { UserContext } from "../App";
import Button from "react-bootstrap/Button";


function Signin(){
    const navigate=useNavigate();
    const {state,dispatch}=useContext(UserContext);
    const [sess,setSess]=useState({
        username:"",password:""
    });
    // Alert
    const [errormsg,setErrorMsg]=useState("");
    const [cond,setCond]=useState(false);
    // Loading
    const [load,setLoad]=useState(false);
    // Password Visibility
    const [isVisible, setVisible] = useState(false);

    function handleChange(event){
        const name=event.target.name;
        const value=event.target.value;
        setSess({...sess,[name]:value});
    }

    async function loginUser(event){
        setLoad(true);
        event.preventDefault();
        const {username,password}=sess
        const res=await fetch("/login",{
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "Accept":"application/json"
            },
            body:JSON.stringify({
                username,password
            })
        });
        // const data=await res.json();
        if(res.status===400){
            // window.alert("Invalid");
            setErrorMsg("Please fill all fields");
            setCond(true);
            navigate("/signin");
            setSess({username:"",password:""});
        }else if(res.status===401){
            setErrorMsg("Invalid Credentials");
            setCond(true);
            navigate("/signin");
            setSess({username:"",password:""});
        }else if(res.status===200){
            const data=await res.json();
            localStorage.setItem("uid",data._id);
            localStorage.setItem("username",sess.username);
            const uname=localStorage.getItem("username")===sess.username?true:false;
            dispatch({type:"USER",payload:uname});
            setCond(false);
            navigate("/chats");
        }
        setLoad(false);
    }
    setTimeout(function () {
        setCond(false);
    }, 10000);

    return(
        <div id="signup">
            <div>
            <h1 id="center">Login</h1>
            {cond && <Alert msg={errormsg} type={"warning"}/>}
            <form method="POST" disabled={load}>
            <div className="input-group mb-3">
                <span className="input-group-text name required my-2">Email</span>
                <input type="email" className="form-control" id="username" aria-describedby="emailHelp" name="username" onChange={handleChange} value={sess.username}/>
            </div>
            <div className="input-group mb-3">
                <span className="input-group-text name required my-2">Password</span>
                <input type={!isVisible ? "password" : "text"} className="form-control" id="password" name="password" onChange={handleChange} value={sess.password}/>
            </div>
            <input type="checkbox" disabled={load} onClick={()=>setVisible(!isVisible)} style={{transform : "scale(1.5)",margin:"2px"}}/> Show Password
            <br/><br/>
            <button type="submit" className="btn btn-primary" disabled={load} onClick={loginUser} style={{width:"100%"}}>{load===false?"Submit":<div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>}</button>
            </form>
            <br/><br/>
            <ul className="list-group list-group-horizontal d-flex justify-content-around" type="none">
            <li className="nav-item">
            <h5>Want to signup?</h5>
            </li>
            <li>
            <NavLink className="nav-link" to="/signup"><Button className="btn btn-sm btn-success" style={{padding:"5px",fontSize:"1rem"}}>Register</Button></NavLink>
            </li>
            </ul>
            </div>
        </div>
    )
}
export default Signin;