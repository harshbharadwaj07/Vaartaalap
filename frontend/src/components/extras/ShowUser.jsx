import CloseButton from "react-bootstrap/CloseButton";
import Badge from "react-bootstrap/esm/Badge";
function ShowUser({user,handleFunc}){
    return (
        <>
            <Badge pill bg="warning" text="dark" className="mb-4">
                {user.name} 
                <CloseButton onClick={handleFunc} size="sm"/>
            </Badge>{' '}
        </>
    )
}
export default ShowUser;