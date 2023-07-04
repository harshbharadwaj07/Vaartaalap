import { useContext } from "react";
import { UserContext } from "../App";
import Profile from "./extras/Profile";
import SingleChat from "./SingleChat";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import UpdateGroup from "./extras/UpdateGroup";

function ChatBox({fetchAgain,setFetchAgain}){
    const {theme,setSelectChat,selectChat}=useContext(UserContext);
    const getPerson=(loggedUser,users)=>{
        return users[0].username===loggedUser?users[1]:users[0];
    }
    
    return(
        <div style={{ width: '95%',margin:"1rem" }}>
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
                <>
                <div className="p-2 bg-light d-flex justify-content-between ">
                <Button className="d-sm-block d-md-none" variant="secondary" size="sm" onClick={()=>setSelectChat({})}>Back</Button>
                <h4 className="fw-bold align-middle top-50" style={{color:"black"}}>{selectChat.GrpChat?(selectChat.chatName):(<>{getPerson(localStorage.getItem("username"),selectChat.users).name}</>)}</h4>
                <div>
                {selectChat.GrpChat?(<UpdateGroup fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>):(<Profile user={getPerson(localStorage.getItem("username"),selectChat.users)}/>)}
                
                </div>
                </div>
                <br/>
                <SingleChat id="single" fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>
                </>
            )}
            
        </div>
    )
}
export default ChatBox;