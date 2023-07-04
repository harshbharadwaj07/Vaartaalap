import { useContext } from "react"
import Card from "react-bootstrap/Card"
import Image from "react-bootstrap/Image"
import { UserContext } from "../../App"

function ListItem({user,handleClick}){
    const {selectChat}=useContext(UserContext);
    return(
        <div>
            <Card onClick={handleClick}>
                <Card.Body>
                    <div className="d-flex justify-content">
                    <Image src={user.pic} roundedCircle="true" width="50px" height="50px" alt={user.name} style={{marginRight:"1.5rem"}}/>
                    <div>
                        {/* {(Object.keys(selectChat).length!==0 && selectChat.GrpChat && selectChat.admin._id===user._id) && <div style={{position:"absolute",right:"0",marginRight:"20px"}}>Admin</div>} */}
                    <Card.Title>{user.name}</Card.Title>
                    <Card.Text>
                    <div><strong>Email: </strong>{user.username}</div>
                    </Card.Text>
                    </div>
                    </div>
                </Card.Body>
                </Card>
        </div>
    )
}
export default ListItem