import { useState } from "react";
import styles from "./sass/chatInput.module.scss";
import TextareaAutosize from 'react-textarea-autosize';
const ChatInput = ({
    sendMessage
}:{
    sendMessage: Function
}) => {
    const [input, setInput] = useState("")
    return <div className={styles.main}>
        <div className={styles.input_box}>
            <TextareaAutosize className={styles.input} maxRows = {6} value={input} onChange={(e: any) => setInput(e.target.value)} />
            {/*<input className={styles.input} value={input} onChange={(e: any) => setInput(e.target.value)} type="text" />*/}
        </div>
        <button className={styles.send_button} onClick={() => {
            setInput("")
            sendMessage(input)
        }}>
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-send" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00bfd8" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <line x1="10" y1="14" x2="21" y2="3" />
                <path d="M21 3l-6.5 18a0.55 .55 0 0 1 -1 0l-3.5 -7l-7 -3.5a0.55 .55 0 0 1 0 -1l18 -6.5" />
            </svg>
        </button>
    </div>
}
export default ChatInput