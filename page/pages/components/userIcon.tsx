import Image from "next/image";
import { useState } from "react";
import { getUrl } from "../../lib/main"
import { parseJwt } from "../../lib/token";

import styles from "./sass/userIcon.module.scss"

const UserIcon = ({
    width = 32,
    height = 32,
    className,
    userId,
    spaceId,
    path,
    token,
    alt = "user icon"
}:{
    width?: number
    height?: number
    className?: any
    userId?: number | string
    token?: string | null
    path?: string
    alt?: string
    spaceId?: number
}) => {
    const [error, setError] = useState(false)
    const a = () => {
        if(token) {
            return parseJwt(token).sub
        } else {
            return -1
        }
    }
    const l = path ? `icons/${path}` : userId ? `icons/id/${userId}` : spaceId ? `icons/space/id/${spaceId}` : `icons/id/${a()}`
    const loader = () => {
        return getUrl(l)
    }
    
    return (
        <div className={className}>
            { (a() || path || userId)&& !error ?
                (<Image
                    loader={loader}
                    src={l}
                    onError={() => setError(true)}
                    alt={alt}
                    width={width}
                    height={height}
                    style={{
                        borderRadius: "100%",
                        objectFit: "cover"
                    }}
                    className={styles.icon}
                />) : (
                    <div style={{
                        borderRadius: "100%",
                        width: width,
                        height: height,
                        backgroundColor: "#ccc"
                    }}></div>
                )
            }
        </div>
    )
}
export default UserIcon