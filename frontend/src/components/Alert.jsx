import React from "react";
function Alert(props){
    return(
        <div id="alert">
            <div className={"alert alert-"+props.type+" w-75 mx-auto alert-dismissible fade show"} role="alert">
                {props.msg}
                <button type="button" className="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        </div>
    )
}
export default Alert;