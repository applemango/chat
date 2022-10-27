import { useState } from "react"
import { deleteFriends } from "../../lib/request"
import { leaveSpace } from "../../lib/space"
import { getToken } from "../../lib/token"
import { TypeUser } from "../../lib/type"
import ActionMenu from "./actionMenu"
import styles from "./sass/bar.module.scss"
const Bar = ({
    friends,
    changeUser,
    changeSpace,
    location,
    locationType,
    createSpace,
    spaces,
    addUser,
    socket,
    reload
}:{
    friends: TypeUser[]
    changeUser: Function
    changeSpace: Function
    location: string
    locationType: string
    createSpace: Function
    spaces: any[]
    addUser: Function
    socket: any
    reload: Function
}) => {
    const [nowHover, setNowHover] = useState(false)
    const [nowHoverActionMenu, setNowHoverActionMenu] = useState(false)
    return <div className={styles.main}>
        <div className={`${styles._} ${nowHover?styles.open:""}`} onMouseEnter={() => {
            setNowHover(true)
        }} onMouseLeave={() => {
            setNowHover(false)
        }}>
            <div className={styles.chat}>
                <div>
                    <div>
                        { !nowHover &&
                            <div className={styles.icon_ui}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-messages" width="28" height="28" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00b341" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10" />
                                    <path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2" />
                                </svg>
                            </div>
                        }
                        { nowHover &&
                            <div className={styles.friends_chat_top}>
                                <div className={styles.icon_ui} style={{display: "flex"}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-messages" width="28" height="28" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00b341" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <path d="M21 14l-3 -3h-7a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1h9a1 1 0 0 1 1 1v10" />
                                        <path d="M14 15v2a1 1 0 0 1 -1 1h-7l-3 3v-10a1 1 0 0 1 1 -1h2" />
                                    </svg>
                                    <p>Chat</p>
                                </div>
                                <button className={styles.create} onClick={() => addUser()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-plus" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00b341" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>
                        }
                    </div>
                    {friends &&
                        friends.map((friend: TypeUser, i:number) => (
                            <div key={i} className={`${styles.user} ${locationType=="user"&&location==String(friend.id)?styles.active:""}`} onClick={() => {
                                if(nowHoverActionMenu) return
                                changeUser(friend.id)
                            }}>
                                <div>
                                    <div className={styles.icon_user}></div>
                                        { nowHover && <div className={styles.info}>
                                            {friend.name}
                                        </div> }
                                </div>
                                { nowHover &&
                                    <Menu reload={reload} socket={socket} space={false} data={friend} t={setNowHoverActionMenu} />
                                }
                            </div>
                    ))}
                </div>
                <div>
                    <div>
                        { !nowHover &&
                            <div className={styles.icon_ui}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-layout-2" width="28" height="28" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00b341" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                    <rect x="4" y="4" width="6" height="5" rx="2" />
                                    <rect x="4" y="13" width="6" height="7" rx="2" />
                                    <rect x="14" y="4" width="6" height="7" rx="2" />
                                    <rect x="14" y="15" width="6" height="5" rx="2" />
                                </svg>
                            </div>
                        }
                        { nowHover &&
                            <div className={styles.friends_chat_top}>
                                <div className={styles.icon_ui} style={{display: "flex"}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-layout-2" width="28" height="28" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00b341" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <rect x="4" y="4" width="6" height="5" rx="2" />
                                        <rect x="4" y="13" width="6" height="7" rx="2" />
                                        <rect x="14" y="4" width="6" height="7" rx="2" />
                                        <rect x="14" y="15" width="6" height="5" rx="2" />
                                    </svg>
                                    <p>Space</p>
                                </div>
                                <button className={styles.create} onClick={() => createSpace()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-plus" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00b341" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                        <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>
                        }
                    </div>
                    { spaces &&
                        spaces.map((space:any, i:number)=>(
                            <div key={i} className={`${styles.user} ${locationType=="space"&&location==String(space.id)?styles.active:""}`} onClick={() => {
                                if(nowHoverActionMenu) return
                                changeSpace(space.id)
                            }}>
                                <div>
                                    <div className={styles.icon_user}></div>
                                    { nowHover && <div className={styles.info}>
                                            {space.name}
                                        </div> }
                                </div>
                                { nowHover &&
                                    <Menu reload={reload} socket={socket} space={true} data={space} t={setNowHoverActionMenu} />
                                }
                            </div>
                        ))}
                </div>
            </div>
        </div>
    </div>
}

const Menu = ({ space = false, data, t, socket, reload }:{ space?:boolean, data:any, t: Function, socket: any, reload: Function }) => {
    const [show, setShow] = useState(false)
    return <ActionMenu className={styles.actionMenu} show={show} setShow={setShow}classNameMain={styles.actionMenuContainer} icon={
        <div className={styles.icon} onMouseEnter={() => t(true)} onMouseLeave={() => t(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-dots" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#9e9e9e" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                <circle cx="5" cy="12" r="1" />
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
            </svg>
        </div>
    }>
        <div className={styles.actionMenuMain} onMouseEnter={() => t(true)} onMouseLeave={() => t(false)}>
            <div>
                <div className={styles.button} onClick={() => {
                    const l = async () => {
                        if(space) {
                            const res = await leaveSpace(data.name)
                        } else {
                            const res = await deleteFriends(data.id)
                            socket.emit("socket_request_reply", {"name":data.name,"token":getToken()})
                        }
                        reload()
                    }
                    l()
                    console.log(data)
                }}>
                    <div>
                        <p style={{color: "#fd0061"}}>{space ? "leave space" : "leave chat"}</p>
                    </div>
                    <div className={styles.icon_}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-eraser" width="20" height="20" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#fd0061" fill="none" strokeLinecap="round" strokeLinejoin="round">
                            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                            <path d="M19 19h-11l-4 -4a1 1 0 0 1 0 -1.41l10 -10a1 1 0 0 1 1.41 0l5 5a1 1 0 0 1 0 1.41l-9 9" />
                            <line x1="18" y1="12.3" x2="11.7" y2="6" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    </ActionMenu>
}
export default Bar