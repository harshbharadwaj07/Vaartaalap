import React,{createContext, useEffect, useReducer, useState} from "react";
import {Route,Routes, useNavigate} from "react-router-dom";
import Home from "./components/Home";
import Signin from "./components/Signin";
import Signup from "./components/Signup";
import Logout from "./components/Logout";
import {initialState,reducer} from "./reducer/useReduer"
import Chats from "./components/Chats";

export const UserContext=createContext();

function App(){
    const navigate=useNavigate();
    const [state,dispatch]=useReducer(reducer,initialState);
    const [selectChat,setSelectChat]=useState({});
    const [chats,setChats]=useState([]);
    const [theme,seTheme]=useState(localStorage.getItem('theme') || 'light');
    const [notification,setNotification]=useState([]);

    const toggleTheme=()=>{
        if(theme==="dark"){
            seTheme("light");
        }else{
            seTheme("dark");
        }
    }
    useEffect(()=>{
        localStorage.setItem('theme', theme);
        document.body.className=theme;
    },[theme]);
    useEffect(()=>{
        if(state){
            navigate("/chats");
        }else{
            navigate("/");
        }
    },[state]);
    return(
        <>
            <UserContext.Provider value={{theme,state,dispatch,selectChat,setSelectChat,chats,setChats,notification,setNotification}}>
            <Routes>
            <Route path="/" element={<Home/>} exact/>
            <Route path="/chats" element={<Chats/>} exact/>
            <Route path="/signin" element={<Signin/>} exact/>
            <Route path="/signup" element={<Signup/>} exact/>
            <Route path="/logout" element={<Logout/>} exact/>
            </Routes>
            <button className="btn btn-secondary theme" onClick={()=>toggleTheme()}>{theme==="light"?"🌙":"☀️"}</button>
            {/* <Footer/> */}
            </UserContext.Provider>
        </>
    )
}
export default App;