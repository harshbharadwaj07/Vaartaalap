import React,{useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import Card from "./Card";
import Alert from "./Alert";

function Contact(){
    const navigate=useNavigate();
    const [user,setUser]=useState({name:"",email:"",phone:"",message:""});
    const [cond,setCond]=useState(false);
    const [errmsg,setErrMsg]=useState({msg:"",type:""});
    function handleChange(event){
        const name=event.target.name;
        const value=event.target.value;
        setUser({...user,[name]:value});
    }
    // // Send data to backend
    async function handleClick(event){
        event.preventDefault();
        const {name,username,phone,message}=user;
        const res=await fetch("/contact",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({name,username,phone,message})
        })
        const data=await res.json();
        if(!data){
            console.log("Message not sent");
        }else if(data.message==="EmptyFields"){
            setCond(true);
            setErrMsg({msg:"Please fill all fields",type:"warning"});
            navigate("/contact");
        }else if(data.message==="Message Sent"){
            // console.log("Message sent");
            setCond(true);
            setErrMsg({msg:"Message sent",type:"success"});
            setUser({...user,message:""});
            // window.alert("Message sent");
        }
    }

    async function callContactData(){
        try{
            const res=await fetch("/contactInfo",{
                method:"GET",
                headers:{
                    "Content-Type":"application/json"
                }
            });
            const data= await res.json();
            setUser({...user,name:data.name,username:data.username,phone:data.phone});
            if(data.status!==200){
                console.log(data.message);
            }
        }catch(err){
            console.log(err);
        }
    }
    setTimeout(function () {
        setCond(false);
    }, 5000);
    useEffect(function(){
        callContactData();
    },[]);

    return(
        <div>
            <div className="p-5 col-11 col-sm-11 col-lg-9 m-auto">
            <div className="row">
                <Card title="Phone" desc="+91 XXXXXXXXXX" />
                <Card title="Email" desc="harsh.bharadwaj.cv@gmail.com" />
                <Card title="Address" desc="New Delhi, India" />
            </div> 
            </div>
            <div id="getinTouch" className="col-9 col-sm-10 col-lg-9">
                <h1>Get in Touch</h1>
                {cond && <Alert msg={errmsg.msg} type={errmsg.type}/>}
                <form id="align" method="post">
                <div className="row">
                <div className="col-sm-4">
                    <input type="text" className="form-control" id="name" aria-describedby="emailHelp" name="name" onChange={handleChange} value={user.name} placeholder="Your name"/>
                </div>
                <div className="col-sm-4">
                    <input type="text" className="form-control" id="username" aria-describedby="emailHelp" name="username" onChange={handleChange} value={user.username} placeholder="Your username"/>
                </div>
                <div className="col-sm-4">
                    <input type="text" className="form-control" id="phone" aria-describedby="emailHelp" name="phone" onChange={handleChange} value={user.phone} placeholder="Your phone"/>
                </div>
                </div>
                <div className="mb-3">
                    <textarea type="text" className="form-control" id="message" aria-describedby="emailHelp" name="message" onChange={handleChange} value={user.message} placeholder="Message" />
                </div>
                <button type="submit" className="btn btn-primary" onClick={handleClick}>Send Message</button>
                
                </form>
            </div>
        </div>
    )
}
export default Contact;