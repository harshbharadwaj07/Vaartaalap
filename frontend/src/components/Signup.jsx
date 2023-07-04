
import React,{useState} from "react";
import {useNavigate,NavLink} from "react-router-dom";
import Alert from "./Alert";
import Button from "react-bootstrap/Button";


function Signup(){
    const navigate=useNavigate();
    const [user,setUser]=useState({
        name:"",username:"",password:"",cpassword:"",pic:""
    });
    // Alert
    const [errormsg,setErrorMsg]=useState("");
    const [cond,setCond]=useState(false);
    // Loading
    const [load,setLoad]=useState(false);
    // Password visibility
    const [isVisible, setVisible] = useState(false);

    const handleChange=async(event)=>{
        const name=event.target.name;
        const value=event.target.value;
        setUser({...user,[name]:value});
    }
    const picChange=(e)=>{
        setLoad(true);
        const pics=e.target.files[0];
        if(pics===undefined){
            setCond(true);
            setErrorMsg("Invalid! Please select image");
            return;
        }
        if (pics.type === "image/jpeg" || pics.type === "image/jpg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "OnlineChat");
            data.append("cloud_name", "dub21xmn9");
            fetch("https://api.cloudinary.com/v1_1/dub21xmn9/image/upload", {
                    method: "post",
                    body: data
                })
                .then((res) =>{return res.json()})
                .then((data) => {
                    setUser({
                        ...user,
                        [e.target.name]: data.url.toString()
                    });
                    setLoad(false);
                })
                .catch((err) => {
                    console.log(err);
                });
        }else{
            setCond(true);
            setErrorMsg("Invalid! Please select image");
            setLoad(false);
            return;
        }
    }
    async function handleClick(event){ //Posting data to backend
        setLoad(true);
        event.preventDefault();
        const {name,username,password,cpassword,pic}=user;

        const res=await fetch("/register",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                name,username,password,cpassword,pic
            })
        });
        const data=await res.json();
        // console.log(data);
        if(data.message==="EmptyFields"){
            setErrorMsg("Please fill all fields");
            setCond(true);
            navigate("/signup");
            setUser({name:"",username:"",password:"",cpassword:"",pic:""});
        }else if(data.message==="SmallLen"){
            setErrorMsg("Password should be atleast 6 characters long");
            setCond(true);
            navigate("/signup");
            setUser({name:"",username:"",password:"",cpassword:"",pic:""});
        }else if(data.message==="UserExistsError"){
            setErrorMsg("Username already taken");
            setCond(true);
            navigate("/signup");
            setUser({name:"",username:"",password:"",cpassword:"",pic:""});
        }else{
            window.alert("Registered Successfully");
            setCond(false);
            navigate("/signin");
        }
        setLoad(false);
    }
    setTimeout(function () {
        setCond(false);
    }, 10000);
    return(
        <div id="signup">
            <div>
                <h1 id="center">Registration</h1>
                {cond && <Alert msg={errormsg} type="warning"/>}
                
                <form method="POST">
                <div className="input-group mb-3">
                    <span className="input-group-text name required my-2">Full Name</span>
                    <input type="text" className="form-control" id="name" aria-describedby="emailHelp" name="name" onChange={handleChange} value={user.name}/>
                </div>
                <div className="input-group mb-3">
                    <span className="input-group-text name required my-2">Email</span>
                    <input type="email" className="form-control" id="username" aria-describedby="emailHelp" name="username" onChange={handleChange} value={user.username}/>
                </div>
                <div className="input-group mb-3">
                    <span className="input-group-text name required my-2">Password</span>
                    <input type={!isVisible ? "password" : "text"} className="form-control" id="password" name="password" onChange={handleChange} value={user.password}/>
                </div>
                <div className="input-group mb-3">
                    <span className="input-group-text name required my-2">Confirm Password</span>
                    <input type={!isVisible ? "password" : "text"} className="form-control" id="cpassword" name="cpassword" onChange={handleChange} value={user.cpassword}/>
                </div>
                <input type="checkbox" onClick={()=>setVisible(!isVisible)}/> Show Passwords
                <br/>
                <br/>
                
                <div className="mb-3">
                    <label htmlFor="img" className="form-label">Upload Image</label>
                    <input type="file" className="form-control" id="pic" name="pic" onChange={(e) => {picChange(e)}}/>
                </div>
                <button type="submit" className="btn btn-primary" onClick={handleClick} style={{width:"100%"}}>{load===false?"Submit":<div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>}</button>
                </form>
                    <br/><br/>
                <ul className="list-group list-group-horizontal d-flex justify-content-around" type="none">
                <li className="nav-item">
                <h5>Already signed up?</h5>
                </li>
                <li>
                <NavLink className="nav-link" to="/signin"><Button className="btn btn-sm btn-warning" style={{padding:"5px",fontSize:"1rem"}}>Signin</Button></NavLink>
                </li>
                </ul>
            </div>
        </div>
    )
}
export default Signup;