import { useContext, useState } from "react";
import Modal from "react-bootstrap/Modal"
import Button from "react-bootstrap/Button"
import { UserContext } from "../../App";
import Image from "react-bootstrap/Image"

function Profile({user,children}){
    const {theme,selectChat}=useContext(UserContext);

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        
        <div>
            {children?<span onClick={handleShow}>{children}</span>:(
                <Button variant="secondary" onClick={handleShow}>View</Button>
            )}
            <Modal show={show} onHide={handleClose}
            aria-labelledby="contained-modal-title-vcenter"
            centered
            align="center"
            className="my-modal"
            >
            <Modal.Header closeButton closeVariant={(theme==="light")?("black"):("white")}>
                <Modal.Title id="contained-modal-title-vcenter">
                {user.name}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Image src={user.pic} roundedCircle="true" width="250px" height="250px" alt={user.name}/>
                <h4>{user.username}</h4>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleClose}>Close</Button>
            </Modal.Footer>
            </Modal>

            
        </div>
    )
}
export default Profile;