import { useState,useContext,useEffect } from "react";
import { UserContext } from "../../App";
import { useNavigate } from "react-router-dom";
import ListItem from "../UserList/ListItem";
import Modal from "react-bootstrap/Modal"
import Card from "react-bootstrap/Card"
import Image from "react-bootstrap/Image"
import Button from "react-bootstrap/Button"
import Form from "react-bootstrap/Form"
import Spinner from "react-bootstrap/Spinner"
import Alert from "../Alert";
import io from "socket.io-client";

// const ENDPOINT="http://localhost:5000";
const ENDPOINT="https://vaartalaap-backend.onrender.com";
var socket;

function UpdateGroup({fetchAgain,setFetchAgain,fetchMessages}){
    const navigate=useNavigate();
    const {theme,selectChat,setSelectChat}=useContext(UserContext);
    //modal
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    //group
    const [groupName,setGroupName]=useState();
    const [searchResult,setSearchResult]=useState([]);
    const [load,setLoad]=useState(false);
    const [renameLoad,setRenameLoad]=useState(false);
    const [socketConnect,setSocketConnect]=useState(false);
    const [delgrpload,setDelgrpload]=useState(false);
    //error handling
    const [cond,setCond]=useState(false);
    const [errormsg,setErrorMsg]=useState("")
    const [type,setType]=useState("");

    const handleDel=async(admin)=>{
        setDelgrpload(true);

        if(window.confirm("Are you sure you want to delete the group? This action can't be undone.")){
            try {
                const res=await fetch("/deletegrp",{
                    method:"PUT",
                    headers:{
                        Accept:"application/json",
                        "Content-Type":"application/json"
                    },
                    credentials:"include",
                    body:JSON.stringify({
                        chatId:selectChat._id,
                        adminId:admin
                    })
                });
                const data= await res.json();
                if(data.message==="Group deleted successfully"){
                    socket.emit("grp_deleted",JSON.stringify({
                        deletedGroup:selectChat,
                        admin:admin
                    }));
                    navigate("/chats");
                    setFetchAgain(!fetchAgain) // List of chat gets updated with updated group chat name
                    setSelectChat({});
                }
                setDelgrpload(false);
            } catch (error) {
                setErrorMsg("Error Occured");
                setType("danger");
                setCond(true);
                console.log(error);
            }
        }else setDelgrpload(false);
    }

    const handleRemove=async(userdel)=>{
        try {
            setLoad(true);
            let res={};
            (userdel._id===undefined)?(
                res=await fetch("/remove",{
                    method:"PUT",
                    headers:{
                        Accept:"application/json",
                        "Content-Type":"application/json"
                    },
                    credentials:"include",
                    body:JSON.stringify({
                        chatId:selectChat._id,
                        userId:userdel
                    })
                })
            ):
            (res=await fetch("/remove",{
                method:"PUT",
                headers:{
                    Accept:"application/json",
                    "Content-Type":"application/json"
                },
                credentials:"include",
                body:JSON.stringify({
                    chatId:selectChat._id,
                    userId:userdel._id
                })
            }))
            const data= await res.json();
            socket.emit("grp_updated",JSON.stringify({
                chat:data,
                userId:userdel._id,
                type:"delete"
            }));
            // if(data.users.length===1){
            //     setSelectChat({});
            //     handleClose();
            //     setFetchAgain(!fetchAgain);
            //     return;
            // }

            // if(userdel._id===undefined && selectChat.GrpChat && selectChat.admin._id===userdel){
            //     console.log("admin");
            // }

            
            setFetchAgain(!fetchAgain) // List of chat gets updated with updated group chat name
            fetchMessages();
            setLoad(false);
            setErrorMsg("User removed successfully");
            setType("success");
            setCond(true);
            setSelectChat(data);
            if(selectChat.admin._id!==localStorage.getItem("uid")){
                setSelectChat({});
                handleClose();
            }
            
            
                // navigate("/chats");
                // setFetchAgain(!fetchAgain) // List of chat gets updated with updated group chat name
        } catch (error) {
            setErrorMsg("Error Occured");
            setCond(true);
            setType("danger");
            console.log(error);
        }
    }
    const handleRename=async()=>{
        setRenameLoad(true);
        if(!groupName) return;
        try {
            const res=await fetch("/rename",{
                method:"PUT",
                headers:{
                    Accept:"application/json",
                    "Content-Type":"application/json"
                },
                credentials:"include",
                body:JSON.stringify({
                    chatId:selectChat._id,
                    chatName:groupName
                })
            });
            const data= await res.json();
            setSelectChat(data);
            setFetchAgain(!fetchAgain); // List of chat gets updated with updated group chat name
            setRenameLoad(false);
        } catch (error) {
            setErrorMsg("Error Occured");
            setType("danger");
            setCond(true);
            console.log(error);
        }
        setGroupName("");
    }

    const handleSearch=async(query)=>{
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
                setLoad(false);
            }catch(err){
                setErrorMsg("Error Occured");
                setType("danger");
                setCond(true);
                console.log(err);
            }
        setLoad(false);
    }
    // add user
    const handleGrp=async(addUser)=>{
        if(selectChat.users.find((u)=>u._id===addUser._id)){
            setErrorMsg("User already exist");
            setCond(true);
            setType("warning");
            return;
        }
        try {
            setLoad(true);
            const res=await fetch("/add",{
                method:"PUT",
                headers:{
                    Accept:"application/json",
                    "Content-Type":"application/json"
                },
                credentials:"include",
                body:JSON.stringify({
                    chatId:selectChat._id,
                    userId:addUser._id
                })
            });
            const data= await res.json();
            setSelectChat(data);
            setFetchAgain(!fetchAgain); // List of chat gets updated with updated group chat name

            setErrorMsg("User added successfully");
            setCond(true);
            setType("success");
            socket.emit("grp_updated",JSON.stringify({
                chat:data,
                userId:addUser._id,
                type:"add"
            }));
            setLoad(false);

        } catch (error) {
            setErrorMsg("Error Occured");
            setCond(true);
            setType("danger");
            console.log(error);
        }
    }
    useEffect(()=>{
        socket=io(ENDPOINT);
        socket.emit("setup",localStorage.getItem("uid"));
        socket.on("connection",()=>setSocketConnect(true));
    },[]);
    setTimeout(function () {
        setCond(false);
    }, 5000);
    return(
        <>
            {/* Group */}
            <Button variant="secondary" onClick={handleShow}>View</Button>
            <Modal show={show} onHide={handleClose}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            className="my-modal"
            scrollable
            >
            <Modal.Header closeButton closeVariant={(theme==="light")?("black"):("white")}>
                <Modal.Title id="contained-modal-title-vcenter">
                {selectChat.chatName}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {cond && <Alert msg={errormsg} type={type}/>}
            <Form className="d-flex">
                <Form.Control type="text" placeholder="Enter new group name" onChange={(e)=>setGroupName(e.target.value)} autoComplete="off"/>
                <Button type="submit" variant="success" className="w-50 my-2" onClick={handleRename}>{renameLoad===true?<div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>:"Update"}</Button>
            </Form>
            {(selectChat.GrpChat && selectChat.admin.username===localStorage.getItem("username")) && (
                <>
                    <Form>
                        <div className="d-flex">
                        <Form.Control type="text" placeholder="Enter new user to group" onChange={(e)=>handleSearch(e.target.value)} autoComplete="off"/>
                        </div>
                    </Form>

                    {load ? (<div style={{color:(theme==="light"?"dark":"white")}}><br/>Loading...<Spinner animation="border"/></div>)
                    :(
                        (searchResult?.slice(0,4)).map(user=>
                        <ListItem key={user._id} user={user} handleClick={()=>{handleGrp(user)}}/>)
                    )}
                </>
            )}
            

            <h5><br/>Group Members</h5>
            {selectChat.users?.map(user=>(
                <Card key={user._id}>
                <Card.Body>
                    <div className="d-flex justify-content">
                    <Image src={user.pic} roundedCircle="true" width="50px" height="50px" alt={user.name} style={{marginRight:"1.5rem"}}/>
                    <div>
                        {/* Displaying Admin infront of the admin */}
                        {(Object.keys(selectChat).length!==0 && selectChat.GrpChat && selectChat.admin._id===user._id) && <div style={{position:"absolute",right:"0",marginRight:"20px"}}>Admin</div>}
                        
                        {/* Removing users by admin */}
                        {(Object.keys(selectChat).length!==0 && selectChat.GrpChat && selectChat.admin.username===localStorage.getItem("username") && selectChat.admin._id!==user._id) && <Button style={{position:"absolute",right:"0",marginRight:"20px"}} variant="outline-danger" onClick={()=>handleRemove(user)}>Remove</Button>}

                    <Card.Title>{user.name}</Card.Title>
                    <Card.Text>
                    <div><strong>Email: </strong>{user.username}</div>
                    </Card.Text>
                    </div>
                    </div>
                </Card.Body>
                </Card>
            ))}
            </Modal.Body>
            <Modal.Footer>
                {(selectChat.GrpChat && selectChat.admin._id===localStorage.getItem("uid"))
                ?(<Button onClick={()=>handleDel(localStorage.getItem("uid"))} variant="danger">
                    {delgrpload===false?"Delete Group"
                    :<div className="spinner-border" role="status"><span className="visually-hidden">Loading...</span></div>}
                    </Button>)
                :(<Button onClick={()=>handleRemove(localStorage.getItem("uid"))} variant="danger">Leave Group</Button>)}
            </Modal.Footer>
            </Modal>
        </>
    )
}
export default UpdateGroup;