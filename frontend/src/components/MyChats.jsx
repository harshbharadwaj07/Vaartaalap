import React, { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import Card from "react-bootstrap/Card"
import Button from "react-bootstrap/Button"
import Spinner from "react-bootstrap/Spinner";
import Image from "react-bootstrap/Image";
import GroupChat from "./extras/GroupChat";
import io from "socket.io-client";
import Alert from "react-bootstrap/Alert"

// const ENDPOINT="http://localhost:5000";
const ENDPOINT="https://vaartalaap.onrender.com";
var socket;

function MyChats({fetchAgain,setFetchAgain}){
    const [loggedUser,setLoggedUser]=useState("");
    const {theme,selectChat,setSelectChat,chats,setChats}=useContext(UserContext);
    const [socketConnect,setSocketConnect]=useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [type,setType]=useState("");
    const [alertMessage, setAlertMessage] = useState("");
    const [loadChat,setLoadChat]=useState(false);

    const getPerson=(loggedUser,users)=>{
        return users[0].username===loggedUser?users[1]:users[0];
    }
    const fetchChats=async ()=>{
        setLoadChat(true);
        try{
            const res=await fetch("/chats",{
                method:"GET",
                headers:{
                    Accept:"application/json",
                    "Content-Type":"application/json"
                },
                credentials:"include"
            });
            if(res.status===200){
                const data=await res.json();
                setChats(data);
                setLoadChat(false);
            }
        }catch(err){
            navigate("/signin");
            console.log(JSON.parse(err));
        }
    }
    useEffect(()=>{
        socket=io(ENDPOINT);
        socket.emit("setup",localStorage.getItem("uid"));
        socket.on("connection",()=>setSocketConnect(true));
    },[]);
    useEffect(()=>{
        const uname=localStorage.getItem("username");
        fetchChats();
        setLoggedUser(uname);
    },[fetchAgain]);
    useEffect(()=>{
        socket.on("display_new_grp",(newGrpReceive)=>{
            setShowAlert(false);
            let alertMessage = `'${newGrpReceive.admin.name}' created the group: '${newGrpReceive.chatName}' and added you`;
            setChats([newGrpReceive,...chats]);
            setAlertMessage(alertMessage);
            setType("success");
            setShowAlert(true);
        });
        return ()=>{
          socket.off("display_new_grp");
        }
    });
    useEffect(() => {
        socket.on("display_updated_grp", (updateGrpReceive) => {
            let parseData = JSON.parse(updateGrpReceive);
            if(parseData.userId===localStorage.getItem("uid")){
      
            // if chat is selected we remove seletion
            let alertMessage="";
            if(parseData.msg==="danger"){
              setShowAlert(false);
              alertMessage = `You are no longer a participant of group: '${parseData.chat.chatName}'`;

              // Check if the updated chat is in the user's existing chats
              const existingChat = chats.find((chat) => chat._id === parseData.chat._id);
              if (existingChat) {
                    const updatedChats = chats.filter((chat) => chat._id !== parseData.chat._id);
                    setChats(updatedChats);
                    if(selectChat){
                        setSelectChat({});
                    }
                }
            }
            if (parseData.msg === "success") {
                setShowAlert(false);
                alertMessage = `You have been added to group: '${parseData.chat.chatName}'`;
                setChats([parseData.chat,...chats]);
            }
            
            // Display the alert
            setAlertMessage(alertMessage);
            setType(parseData.msg);
            setShowAlert(true);
            }
            else{ // for everyone else whose in in the group
                setChats((prevChats) => {
                    return prevChats.map((chat) => {
                        if (chat._id === parseData.chat._id) {
                            return parseData.chat; // Replace the chat with the updated one
                        }
                        return chat; // Keep the chat unchanged
                    });
                });
                if(selectChat._id===parseData.chat._id)
                    setSelectChat(parseData.chat);
            }
        });
      
        return () => {
          socket.off("display_updated_grp");
        };
      });
      
      useEffect(() => {
        socket.on("remove_deleted_grp", (deletedGroupData) => {
          const parseData = (deletedGroupData);
          const updatedChats = chats.filter((chat) => chat._id !== parseData._id);
          setShowAlert(false);
          let alertMessage = `'${deletedGroupData.admin.name}' deleted the group: '${deletedGroupData.chatName}'`;
          setAlertMessage(alertMessage);
          setChats(updatedChats);
          if(selectChat._id===deletedGroupData._id){
            setSelectChat({});
          }
            setType("warning");
            setShowAlert(true);
        });
      
        // Clean up the socket listener when the component unmounts
        return () => {
          socket.off("remove_deleted_grp");
        };
      });
      

    return(
        <div style={{ width: '100%',margin:"1rem" }}>
            <div className="d-flex justify-content-between px-3">
            <h2 className="fs-2 fw-bold">Chats</h2>
            <GroupChat>
            <Button variant="secondary" size="sm" >+ New Group Chat</Button>
            </GroupChat>
            </div>
            {showAlert && (
                <Alert variant={type} onClose={() => setShowAlert(false)} dismissible  style={{margin:"15px"}}>
                    <strong>{alertMessage}</strong>
                </Alert>
            )}
            <div className="overflow-y-scroll p-3" style={{height:"80vh"}}>
                {/* {console.log(selectChat)} */}
            
            {(chats.length===0 && loadChat===false) && (<b>Search a user to begin chat</b>)}
            {(chats.length>0) ? (
                chats.map((chat) => (
                    <Card onClick={() => setSelectChat(chat)} key={chat._id} style={selectChat._id===chat._id?{backgroundColor:"#38B2AC",color:"white"}:{}}>

                    <Card.Body>
                    <div className="d-flex justify-content">
                    <Image src={!chat.GrpChat?(getPerson(loggedUser, chat.users).pic):("https://t4.ftcdn.net/jpg/03/78/40/51/360_F_378405187_PyVLw51NVo3KltNlhUOpKfULdkUOUn7j.jpg")} roundedCircle="true" width="50px" height="50px" style={{marginRight:"1.5rem"}}/>
                    <div>
                    <Card.Title>{!chat.GrpChat
                        ? getPerson(loggedUser, chat.users).name
                        : chat.chatName}</Card.Title>
                    <Card.Text>
                    <div>{chat.latestMsg && (
                        <span fontSize="xs">
                            <b>{(chat.latestMsg.sender.username===localStorage.getItem("username")?("You"):(chat.latestMsg.sender.name))} : </b>
                            {chat.latestMsg.body.length > 50
                            ? chat.latestMsg.body.substring(0, 26) + "..."
                            : chat.latestMsg.body}
                        </span>
                    )}</div>
                    </Card.Text>
                    </div>
                    </div>
                </Card.Body>
                </Card>
                ))
            ) : (
                (loadChat) && <div style={{color:(theme==="light"?"dark":"white")}}><strong>Fetching Chats ... </strong><Spinner animation="grow" size="lg"/></div>
                
            )}
        </div>
        </div>
    )
}
export default MyChats;