import { useEffect } from "react";

export function useKey(key,action){
useEffect(()=>{
    function callBack(e){
        if(e.code.toLowerCase()===key.toLowerCase()){
            action();
        }

    }
document.addEventListener("keydown",callBack)
return ()=>{
    document.removeEventListener(key,callBack)
}
},[key,action])
}