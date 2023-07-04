import React from "react";

function Card(props){
    return(
        <div className="col-sm-4">
            <div className="card">
            <div className="card-body">
                <h6 className="card-title">{props.title}</h6>
                <p className="card-text">{props.desc}</p>
            </div>
            </div>
        </div>
    );
}
export default Card;