import { useContext, useEffect, useState, useRef } from "react";
import { UserContext } from "../App";
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Spinner from "react-bootstrap/Spinner";
import Toast from "react-bootstrap/Toast";
import io from "socket.io-client";
import ScrollableChat from "./ScrollableChat";
import Profile from "./extras/Profile";
import Image from "react-bootstrap/Image";
import UpdateGroup from "./extras/UpdateGroup";

// const ENDPOINT="http://localhost:5000";
const ENDPOINT="https://vaartalaap-backend.onrender.com";
var socket,selectChatCompare;

function SingleChat({fetchAgain,setFetchAgain}){
    const textareaRef = useRef(null);
    const {selectChat,setSelectChat,notification,setNotification,theme}=useContext(UserContext);
    const [messages,setMessages]=useState([]);
    const [load,setLoad]=useState(false);
    const [newMessage,setNewMessage]=useState();
    const [socketConnect,setSocketConnect]=useState(false);
    const [sending,setSending]=useState(false);
    // Toast
    const [showB, setShowB] = useState(true);
    const toggleShowB = () => setShowB(!showB);
    const getPerson=(loggedUser,users)=>{
      return users[0].username===loggedUser?users[1]:users[0];
    }

    const handleChange = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
      } else if (e.key !== "Enter") {
        e.target.style.height = 'inherit';
        e.target.style.height = `${e.target.scrollHeight}px`;
        setNewMessage(e.target.value);
      }
    }
    
    
    const handleSubmit=async(event)=>{
      setSending(true);
      if(!event.shiftKey){
      if(((event.key==="Enter" && !event.shiftKey)||event.type==="click") && newMessage.trim()){
        // textareaRef.current.style.height = 'auto'; // Reset textarea height
        try {
          const res=await fetch("/sendMsg",{
              method:"POST",
              headers:{
                  "Content-Type":"application/json"
              },
              credentials:"include",
              body:
                  JSON.stringify({
                  context:newMessage,
                  chatId: selectChat._id
              })
          });
          const data=await res.json();
            // if(res.status===200){
              setNewMessage("");
              socket.emit("new message",data);
              setMessages([...messages,data]);
              setFetchAgain(!fetchAgain);
              textareaRef.current.style.height = 'auto';
            // }    
          }catch (error) {
            <Toast onClose={toggleShowB} show={showB} animation={false}>
            <Toast.Header>
              <strong className="me-auto">Error Occured</strong>
            </Toast.Header>
            <Toast.Body>Failed to send message</Toast.Body>
          </Toast>
        }
      }
    }
      setSending(false);
    }

    const fetchMessages=async()=>{
      if(!selectChat) return;
      try {
        setLoad(true);
        if(Object.keys(selectChat).length!==0){
        const res=await fetch(`/messages/${selectChat._id}`,{
          method:"GET",
          headers:{
              "Content-Type":"application/json"
          },
          credentials:"include"
        });

        const data=await res.json();
          // if(res.status===200){
            setMessages(data);
            setLoad(false);
            socket.emit("join chat",selectChat._id);
          // }
      }
      } catch (error) {
        console.log(error);
      }
    }

    useEffect(()=>{
      socket=io(ENDPOINT);
      socket.emit("setup",localStorage.getItem("uid"));
      socket.on("connection",()=>setSocketConnect(true));
    },[]);

    useEffect(()=>{
      fetchMessages();
      selectChatCompare=selectChat;
    },[selectChat]);
    
    useEffect(()=>{
      socket.on("message received",(newMsgReceive)=>{
        if(!selectChatCompare||selectChatCompare._id!==newMsgReceive.chat._id){
          // give notification
          if(notification.includes(newMsgReceive)===false){
            setNotification([...notification,newMsgReceive]);
            // handleNotifs();
          }
        }else{
          setMessages([...messages,newMsgReceive]);
        }
        setFetchAgain(!fetchAgain);
      });
      return ()=>{
        socket.off("message received");
      }
    });


    return(
        <div style={{ width: '95%',margin:"1rem",marginBottom:"20px" }}>
          {(Object.keys(selectChat).length===0)
          ?(
              <>
              <div className="d-flex align-items-center justify-content-center" style={{height:"70vh",width:"100%"}}>
                  <div>
                  <Image src={theme==="light"?("startupLight.png"):("startupDark.png")} roundedCircle="true" width="300vw" height="300vh"/>
                  <h2>Click on a user to chat</h2>
                  </div>
              </div>
              </>
          )
          :(
            <div className="d-flex flex-column bd-highlight mb-3">
          <div className="p-2 bd-highlight">
            <div className="p-2 bg-light d-flex justify-content-between">
              <Button className="d-sm-block d-md-none" variant="secondary" size="sm" onClick={()=>setSelectChat({})}>Back</Button>
              <h4 className="fw-bold align-middle top-50" style={{color:"black"}}>{selectChat.GrpChat?(selectChat.chatName):(<>{getPerson(localStorage.getItem("username"),selectChat.users).name}</>)}</h4>
              <div>
              {selectChat.GrpChat?(<UpdateGroup fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages}/>):(<Profile user={getPerson(localStorage.getItem("username"),selectChat.users)}/>)}
              
              </div>
            </div>
            </div>
          

            {load?<div className = "d-flex align-items-center justify-content-center" style={{height:"70vh"}}><Spinner  style={{height:"60px",width:"60px"}}/></div>
            :<><div className="p-2 bd-highlight" id="single" style={{height:"65vh",marginBottom:"20px"}}>
            {/* <div > */}
              {/* Displaying messages */}
              <ScrollableChat messages={messages}/>
            {/* </div> */}
            </div>
            <div className="d-flex align-items-center">
              <Form.Group className="flex-grow-1 mb-0" controlId="formBasicEmail" onKeyDown={handleSubmit}>
                <Form.Control
                  as="textarea"
                  type="text"
                  placeholder="Type message (Press Enter to send message)"
                  rows={1}
                  onChange={handleChange}
                  value={newMessage}
                  autoComplete="off"
                  style={{ maxHeight: "80px" }}
                  ref={textareaRef}
                  disabled={sending}
                />
              </Form.Group>
              <Button className="ml-2" variant="success" disabled={sending} onClick={handleSubmit}>{sending?<Spinner size="sm"/>:"Send"}</Button>
            </div>

            </>}
        </div>
      )}
      </div>
  )
}
export default SingleChat;