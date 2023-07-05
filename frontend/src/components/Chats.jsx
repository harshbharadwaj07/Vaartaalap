import { useState,useContext } from "react";
import { UserContext } from "../App";
import SideDrawer from "./extras/sideDrawer";
import MyChats from "./MyChats";
import SingleChat from "./SingleChat";

function Chats(){
    const {theme,state,selectChat}=useContext(UserContext);
    const [fetchAgain,setFetchAgain]=useState(false);
    return(
        <div id="body" style={{width:"100%",borderColor:"1px solid black",height:"100%",paddingBottom:"0px"}}>
            {state && <SideDrawer/>}
            <div className="d-flex flex-row w-100 justify-content-between">
                {(Object.keys(selectChat).length===0)?
                (<><div className="col-11 col-md-4" style={{height:"85vh",padding:"1rem"}}>
                {state && <MyChats fetchAgain={fetchAgain}/>}
                </div>
                <div className="d-none d-md-block col-sm-8" style={{height:"90vh",padding:"1rem",borderLeft:(theme==="light"?"1px solid #292b2c":"1px solid white")}}>
                {state && <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
                </div></>)
                :(<><div className="d-none d-md-block col-md-4" style={{height:"90vh",padding:"1rem",borderRight:(theme==="light"?"1px solid #292b2c":"1px solid white")}}>
                {state && <MyChats fetchAgain={fetchAgain}/>}
                </div>
                <div className="col-12 col-md-8" style={{height:"85vh",padding:"0.5rem"}}>
                {state && <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain}/>}
                </div></>)}

            </div>
        </div>
    );
}

export default Chats;