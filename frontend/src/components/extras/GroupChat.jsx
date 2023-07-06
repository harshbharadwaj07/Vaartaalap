import { useState,useContext,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../App";
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button" 
import Form from "react-bootstrap/Form"
import Spinner from "react-bootstrap/Spinner";
import ListItem from "../UserList/ListItem";
import ShowUser from "./ShowUser";
import Alert from "../Alert"
import io from "socket.io-client"

// const ENDPOINT="http://localhost:5000";
const ENDPOINT="https://vaartalaap-backend.onrender.com";
var socket;

function GroupChat({children}){
    const navigate=useNavigate();
    // Modal
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const {theme,chats,setChats,setSelectChat}=useContext(UserContext);
    // Group Chat
    const [groupName,setGroupName]=useState("");
    const [selectUser,setSelectUser]=useState([]);
    const [searchResult,setSearchResult]=useState([]);
    const [load,setLoad]=useState(false);
    const [socketConnect,setSocketConnect]=useState(false);
    const [creating,setCreating]=useState(false);

    const [errormsg,setErrorMsg]=useState("");
    const [cond,setCond]=useState(false);

    const handleSearch=async (query)=>{
        if(query.length>0){
            setLoad(true);
            if(!query) return;
            
                try{
                    const res=await fetch(`/users?search=${query}`,{
                        method:"GET",
                        headers:{
                            Accept:"application/json",
                            "Content-Type":"application/json"
                        },
                        credentials:"include"
                    });
                    const data= await res.json();
                    setSearchResult(data);
                    if(res.status!==200){
                        navigate("/chats");
                    }
                    else if(res.status===200||res.status===304){
                        // setEmpty(false);
                        setLoad(false);
                        // console.log(data);
                    }
                }catch(err){
                    // navigate("/signin");
                    setCond(true);
                    setErrorMsg("An error occured while loading the list");
                }
            setLoad(false);
        }else setSearchResult([]);
    }

    const handleSubmit=async()=>{
        setCreating(true);
        try {
        const res=await fetch("/group",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:
                JSON.stringify({
                name:groupName,
                users: selectUser.map((u)=>u._id)
            })
        });
        const data=await res.json();
            if(res.status===200){
                setChats([data,...chats]);
                setCond(true);
                setErrorMsg("New Group Chat created");
                handleClose();
                // console.log(data);
                socket.emit("new_grp_created",data);
                setSelectChat(data)
            }if(data.message==="EmptyFields"){
                setCond(true);
                setErrorMsg("Please fill all fields");
            }else if(data.message==="LessUsers"){
                setCond(true);
                setErrorMsg("Select more than 1 user");
            }
            
        } catch (error) {
            setErrorMsg(error);
            setCond(true);
        }
        setCreating(false);
    }

    const handleGrp = (addUser) => {
        const userExists = selectUser.some((user) => user._id === addUser._id);
      
        if (userExists) {
          setErrorMsg("User already selected");
          setCond(true);
          return;
        }
      
        setSelectUser([...selectUser, addUser]);
      };
      

    const handleDel=(usr)=>{
        setSelectUser(selectUser.filter((sel)=>sel._id!==usr._id));
    }
    useEffect(()=>{
      socket=io(ENDPOINT);
      socket.emit("setup",localStorage.getItem("uid"));
      socket.on("connection",()=>setSocketConnect(true));
    },[]);
    
    setTimeout(function () {
        setCond(false);
    }, 10000);

    return(
        <div>
            {children && <span onClick={handleShow}>{children}</span>}
            <Modal show={show} onHide={handleClose}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="my-modal"
            >
            <Modal.Header closeButton closeVariant={(theme==="light")?("black"):("white")}>
                <Modal.Title id="contained-modal-title-vcenter">
                Create New Group
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {cond && <Alert msg={errormsg} type={"warning"}/>}
                <Form>
                    <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlInput1"
                    >
                    <Form.Control
                        type="text"
                        placeholder="Chat Name"
                        autoFocus
                        disabled={creating}
                        onChange={(e)=>setGroupName(e.target.value)}
                        autoComplete="off"
                    />
                    </Form.Group>
                    <Form.Group
                    className="mb-3"
                    controlId="exampleForm.ControlTextarea1"
                    >
                    <Form.Control
                        type="text"
                        placeholder="Add Members"
                        disabled={creating}
                        onChange={(e)=>handleSearch(e.target.value)}
                        autoComplete="off"
                    />
                    </Form.Group>
                </Form>
                {/* {console.log(selectUser)} */}
                {selectUser?.map(usr=>(
                    <ShowUser
                    key={usr._id}
                    user={usr}
                    handleFunc={()=>handleDel(usr)}
                    />
                ))}
                
                {load ? <div style={{color:(theme==="light"?"dark":"white")}}><br/><Spinner animation="border"/></div>:(searchResult?.slice(0,4)).map(user=>
                    <ListItem key={user._id} user={user} handleClick={()=>{handleGrp(user)}}/>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="success" disabled={creating} onClick={handleSubmit}>{creating?<Spinner size="sm"/>:"Create Group"}</Button>
            </Modal.Footer>
            </Modal>
        </div>
    )
}
export default GroupChat;