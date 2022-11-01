import { useRef, useState } from "react";
import styles from "./sass/chatInput.module.scss";
import TextareaAutosize from 'react-textarea-autosize';
import { postMessageFile } from "../../lib/postFile";
import ChatInputFile from "./chatInputFile";
const ChatInput = ({
    sendMessage,
    location
}:{
    sendMessage: Function
    location: string[]
}) => {
    const [input, setInput] = useState("")
    const [minHeight, setMinHeight] = useState(0)
    const [selectedFile, setSelectedFile] = useState<File>()
    const [path, setPath] = useState("")
    const [extension, setExtension] = useState("")
    const ref = useRef<any>(null)
    return <div className={styles.main}>
        <div className={styles._}>
            { (path && extension) &&
                <div className={styles.file}>
                    <ChatInputFile path={path} extension={extension} />
                </div>
            }
            <div className={styles.input_box}>
                <TextareaAutosize onHeightChange={(e) => {
                    if(minHeight == 0 && e > 0) {
                        setMinHeight(e)
                    }
                }} className={styles.input} maxRows = {6} value={input} onChange={(e: any) => setInput(e.target.value)} />
                <div>
                    <button className={styles.upload_button} onClick={(e:any) => {
                        ref.current.click()
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-upload" width="18" height="18" viewBox="0 0 24 24" strokeWidth="2" stroke="#2c3e50" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" />
                            <polyline points="7 9 12 4 17 9" />
                            <line x1="12" y1="4" x2="12" y2="16" />
                        </svg>
                    </button>
                    <input style={{display: "none"}} type="file" ref={ref} onChange={(e:any) => {
                        e.preventDefault()
                        setSelectedFile(e.target.files[0])
                        if(!e.target.files[0]) {
                            return
                        }
                        const p = async () => {
                            const res = await postMessageFile(e.target.files[0], location[1] != "user", Number(location[0]))
                            if (res) {
                                setPath(res.path)
                                setExtension(res.extension)
                            }
                        }
                        p()
                        //console.log(e.target.files)
                    }} />
                </div>
            </div>
        </div>
        <button className={styles.send_button} onClick={() => {
            setInput("")
            setPath("")
            setExtension("")
            sendMessage(input, path)
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