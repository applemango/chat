import { dateConversion, getExtension } from "../../lib/utility"
import ChatMessageFile from "./chatMessageFile"
import ChatMessageImage from "./chatMessageImage"
import styles from "./sass/chatMessage.module.scss"
import UserIcon from "./userIcon"
const ChatMessage = ({
    data
}:{
    data: any
}) => {
    return <div className={styles._}>
        {/*<div className={styles.icon_user}></div>*/}
        <UserIcon className={styles.icon_user} userId={data.from} />
        <div style={{width: "calc(100% - 32px)"}}>
            <div className={styles.top}>
                <div className={styles.info}>
                    <p className={styles.username}>{data.from_user_name}</p>
                    <p>{dateConversion(data.timestamp)}</p>
                </div>
            </div>
            <div className={styles.main}>
                {/*<p>{data.body}</p>*/}
                { data.body.split('\n').map((line:string, i:number) => (
                    <p key={i}>{line}</p>
                )) }
                { data.file && <div>
                    { ["png","jpg","jpeg"].indexOf(getExtension(data.file)) + 1 ? (
                        <ChatMessageImage path={data.file} />
                    ):(
                        <ChatMessageFile path={data.file} />
                    )}
                </div> }
            </div>
        </div>
    </div>
}
export default ChatMessage