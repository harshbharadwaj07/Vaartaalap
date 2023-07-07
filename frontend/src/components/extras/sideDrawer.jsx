import React,{useState,useEffect, useContext} from "react";
import { useNavigate,NavLink } from "react-router-dom";
import Profile from "./Profile";
import ListItem from "../UserList/ListItem";
import { UserContext } from "../../App";

import Offcanvas from "react-bootstrap/Offcanvas"
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from "react-bootstrap/esm/Button";
import Spinner from "react-bootstrap/Spinner";

function SideDrawer(){
    const navigate=useNavigate();
    // search
    const [search,setSearch]=useState("");
    const [searchResult,setSearchResult]=useState([]);
    const [empty,setEmpty]=useState(false);

    // loading
    const [load,setLoad]=useState("");
    const [loadChat,setLoadChat]=useState("");
    
    // bootstrap offcanvas
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const {theme,setSelectChat,chats,setChats,notification,setNotification}=useContext(UserContext);
    const [userData,setUserData]=useState({}); // to store data from backend

    const handleSeach=async()=>{ // Searching user
        setLoadChat(true);
        if(search){
            try{
                const res=await fetch(`/users?search=${search}`,{
                    method:"GET",
                    headers:{
                        Accept:"application/json",
                        "Content-Type":"application/json"
                    },
                    credentials:"include"
                });
                const data= await res.json();
                if(res.status!==200){
                    navigate("/chats");
                }
                else if(res.status===200||res.status===304){
                    setSearchResult(data);
                    // console.log("Success");
                    setEmpty(false);
                }
            }catch(err){
                navigate("/signin");
                // console.log(err);
            }
        }else{
            setEmpty(true);
        }
        setLoadChat(false);
    }
    async function openChat(userId){  // opening chats from list
        try{
            setLoad(true);
            const res=await fetch("/postchats",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json"
                },
                body:JSON.stringify({
                    userId
                })
            });
            const data= await res.json();
            if(!chats.find((c)=>c._id===data._id)) setChats([data,...chats]);
            setSelectChat(data);
            setLoad(false);
            if(res.status!==200){
                navigate("/chats");
            }
            else if(res.status===200||res.status===304){
                // console.log("Success");
                setShow(false);
            }
        }catch(err){
            // navigate("/signin");
            // <Alert msg="Failed to load Chat" type="warning"/>
            console.log(err);
        }
    }
    async function callAboutPage(){ // taking data from backend
        try{
            const res=await fetch("/profile",{
                method:"GET",
                headers:{
                    Accept:"application/json",
                    "Content-Type":"application/json"
                },
                credentials:"include"
            });
            const data= await res.json();
            if(res.status!==200){
                navigate("/signin");
            }
            else if(res.status===200){
                setUserData(data);
            }
        }catch(err){
            navigate("/signin");
            // console.log(err);
        }
    }
    useEffect(function(){
        callAboutPage();
    },[]);


    return(
        <div className="p-2 w-100 bg-light d-flex justify-content-between">
            <button className="btn btn-outline-success btn-sm" type="button" onClick={handleShow} title="Search Users">
            <i className="fa-solid fa-magnifying-glass"></i> Search</button>
            <Offcanvas show={show} onHide={handleClose} style={{backgroundColor:(theme==="light"?"white":"#292b2c")}}>
                <Offcanvas.Header closeButton closeVariant={(theme==="light")?("black"):("white")}>
                <Offcanvas.Title style={{color:(theme==="light"?"dark":"white")}}>Search Users</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body>
                    <div className="d-grid gap-2">
                <InputGroup>
                <Form.Control
                aria-label="Default"
                aria-describedby="inputGroup-sizing-default"
                placeholder="Search Users"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                />
                </InputGroup>
                <Button variant="primary" onClick={handleSeach}>Go</Button>
                </div>
                <br/>
                {empty?(<div>Enter some data</div>):(<></>)}
                {loadChat?(<div style={{color:(theme==="light"?"dark":"white")}}><strong>Loading...</strong><Spinner animation="grow" size="lg"/></div>):(searchResult?.map(user=>(
                    <ListItem
                    key={user._id}
                    user={user}
                    handleClick={()=>openChat(user._id)}
                    />
                )))}
                <br/>
                {load && (<div style={{color:(theme==="light"?"dark":"white")}}><strong>Wait...</strong><Spinner animation="grow" size="lg"/></div>)}
                </Offcanvas.Body>
            </Offcanvas>
            
            <h2 className="fw-bold align-middle" style={{margin:"auto"}}>Vaartalaap</h2>
            <div>
                {/* Notification */}
                <DropdownButton
                    align="end"
                    title={<><i className="fa-solid fa-bell fs-4 p-2"></i><span className="badge text-bg-secondary">{notification.length!==0 && notification.length}</span></>}
                    className="d-inline-block"
                    variant="white"
                    >
                        {notification.length===0?(<Dropdown.Item>No new notifications</Dropdown.Item>):(
                        <>
                            {notification.map((notif)=>{
                                return(
                                    <Dropdown.Item key={notif._id}
                                    onClick={()=>{
                                        setSelectChat(notif.chat);
                                        setNotification(notification.filter((n)=>n!==notif));
                                    }}>
                                        {notif.chat.GrpChat?`New message in ${notif.chat.chatName}`:`New message from ${notif.sender.username}`}
                                    </Dropdown.Item>
                                    
                                )})}
                        </>)}
                </DropdownButton>
                
                {/* Profile and logout */}
                <DropdownButton
                align="end"
                title={<img style={{borderRadius:"50%",width:"40px",height:"40px"}} src={userData.pic} alt={userData.name}/> }
                variant="white"
                menuVariant={theme}
                className="d-inline-block"
                >
                
                <Profile user={userData}>
                <Dropdown.Item as="button">Profile</Dropdown.Item>
                </Profile>
                <NavLink className="nav-link" to="/logout"><Dropdown.Item as="button">Logout</Dropdown.Item></NavLink>
                </DropdownButton>
            </div>
        </div>
    )
}
export default SideDrawer;