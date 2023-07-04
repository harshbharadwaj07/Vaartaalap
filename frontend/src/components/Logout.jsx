import {useEffect,useState,useContext} from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../App";
function Logout(){
    const navigate=useNavigate();
    const {state,dispatch,setSelectChat}=useContext(UserContext);
    const [userData,setUserData]=useState({});
    async function callLogoutPage(){
        try{
            const res=await fetch("/logout",{
                method:"GET",
                headers:{
                    Accept:"application/json",
                    "Content-Type":"application/json"
                },
                credentials:"include"
            });
            const data= await res.json();
            setUserData(data);
            localStorage.removeItem("username");
            const uname=localStorage.getItem("username")===userData.username?true:false;
            dispatch({type:"USER",payload:uname});
            if(res.status===200){
                setSelectChat({});
                navigate("/");
            }else if(res.status!==200){
                console.log(data.msg);
            }
        }catch(err){
            navigate("/signin");
        }
    }
    useEffect(function(){
        callLogoutPage()
    },[]);
}
export default Logout;