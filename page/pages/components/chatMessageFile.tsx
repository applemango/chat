
import { getUrl } from "../../lib/main"
import { getToken } from "../../lib/token"
import { getExtension } from "../../lib/utility"
import styles from "./sass/chatMessage.module.scss"
const ChatMessageFile = ({
    path
}: {
    path: string
}) => {
    return <a target="_blank" rel="noopener noreferrer" href={getUrl(`files/${path}?jwt=${getToken()}`)}>
        <div className={styles.file}>
            <p>{getExtension(path)}</p>
        </div>
    </a>
}
export default ChatMessageFile
