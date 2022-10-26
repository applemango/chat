import { useEffect, useRef, useState } from "react"
import ChatMessage from "./chatMessage"
import styles from "./sass/chat.module.scss"
const Chat = ({
    messages
}:{
    messages: any[]
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
            { messages && messages.map((msg:any, i:number) => (
                <div key={i}>
                    <ChatMessage data={msg} />
                </div>
            ))}
        </div>
    </div>
}
export default Chat