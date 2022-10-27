import { useEffect, useRef, useState } from "react"
import ChatMessage from "./chatMessage"
import styles from "./sass/chat.module.scss"
const Chat = ({
    messages,
    location,
    locationType
}:{
    messages: any[]
    location: string,
    locationType: string
}) => {
    const ref = useRef<any>(null)
    const [hover, setHover] = useState(false)
    useEffect(() => {
        ref.current.scrollBy({
            top: ref.current.scrollHeight,
            left: 0,
            behavior: 'smooth'
        });
    },[messages])
    return <div className={`${styles.main} ${hover ? styles.active : ""}`} ref={ref} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
        <div>
            { messages && messages.map((msg:any, i:number) => {
                if(msg.locationType) {
                    if((location == String(msg.to) || location == String(msg.from)) && msg.locationType == locationType) {
                        //console.log(msg.to, location, locationType)
                        return <div key={i}><ChatMessage data={msg} /></div>
                    }
                    if(location == String(msg.to) && msg.locationType == locationType) {
                        //console.log(msg.to, location, locationType)
                        return <div key={i}><ChatMessage data={msg} /></div>
                    }
                    return <div key={i}></div>
                }
                return <div key={i}>
                    <ChatMessage data={msg} />
                </div>
            } )}
        </div>
    </div>
}
export default Chat