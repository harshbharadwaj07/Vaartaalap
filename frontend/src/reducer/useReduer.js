export const initialState=localStorage.getItem("username")!==null?true:false;
export const reducer=(state,action)=>{
    if(action.type==="USER"){
        return action.payload;
    }
    return state;
}