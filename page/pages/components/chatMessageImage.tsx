import styles from "./sass/image.module.scss"
import Image from "next/image";
import { getUrl } from "../../lib/main"
import { getToken } from "../../lib/token";

const ChatMessageImage = ({
    path
}:{
    path: string
}) => {
    const l = getUrl(`files/${path}?jwt=${getToken()}`)
    const loader = () => {
        return l
    }
    return (
        <div className={styles.imageContainer}>
            <Image
                layout="fill"
                objectFit="contain"
                loader={loader}
                src={l}
                style={{
                    objectFit: "cover"
                }}
            />
        </div>
    )
}
export default ChatMessageImage