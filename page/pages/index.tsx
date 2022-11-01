import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
//import styles from '../styles/Home.module.css'
import styles from "../styles/main.module.scss"

import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { getToken, isLogin, isLoginAndLogin, logout, parseJwt } from '../lib/token';
import { useRouter } from 'next/router';
import { getFriendsList } from '../lib/getUserData';

import Modal from 'react-modal'
Modal.setAppElement('#__next')

import { TypeUser } from '../lib/type';

import Header from './components/header';
import Bar from './components/bar';
import ChatHeader from './components/chatHeader';
import Chat from './components/chat';
import ChatInput from './components/chatInput';
import { getSpaceChatHistory, getUserChatHistory } from '../lib/getChatData';
import { createSpace, getSpaceList, joinSpace } from '../lib/space';
import CreateSpace from './components/createSpace';
import CreateUser from './components/addUser';
import { getRequester, getRequesting, requestChat, UnRequestChat } from '../lib/request';

import toast, { Toaster } from 'react-hot-toast';
import { settingsIcon } from '../lib/postUserData';
import UserIcon from './components/userIcon';
import { dateConversion } from '../lib/utility';

const socket = io("ws://192.168.1.2:5000", {
    query : {
        token: getToken()
    }
})

const Home: NextPage = () => {
    const router = useRouter()

    const [location, setLocation] = useState("")
    const [locationType, setLocationType] = useState("user")

    const [messages, setMessages] = useState<any>([])
    const [friends, setFriends] = useState<any>([])
    const [spaces, setSpaces] = useState<any>([])
    const [requesters, setRequesters] = useState<any>([])
    const [requesting, setRequesting] = useState<any>([])

    const [isJoinRoom, setIsJoinRoom] = useState(false)
    const [myUserId, setMyUserId] = useState(-1)

    const [isOpenModal, setIsOpenModal] = useState(false)
    const [modalType, setModalType] = useState("")

    const [settings, setSettings] = useState(false)
    const [settingsId, setSettingsId] = useState("")

    const goHome = () => {
        setLocation("")
        setLocationType("user")
        setMessages([])
    }
    const showSettings = () => {
        if(settings) {
            setSettings(false)
            toast.dismiss(settingsId)
            return
        }
        setSettings(true)
        toast((t) => {
            const [selectedFile, setSelectedFile]:any = useState<File>();
            useEffect(() => {
                setSettingsId(t.id)
            },[t])
            //setSettingsId(t.id)
            return  <span className={styles.toast_settings}>
                <span className={styles.toast}>
                    <div className={styles.toast_main}>

                            <h2 className={styles.settings_name}>icon</h2>
                            <div className = {styles.settings_icon }>
                                <input className = {styles.input_file} name="file" type="file" onChange = {(e) => e.target.files ? setSelectedFile(e.target.files[0]) : ""} accept=".png, .jpg" />
                                <div className = {styles.input_file_}>
                                    <div className = {styles.input_file__}>
                                        <div>
                                            { selectedFile && (
                                                <div className = {styles.logo}></div>
                                            )}
                                            <p className = { selectedFile ? (styles.active) : ("")}>{selectedFile ? (selectedFile.name) : ("Drag and drop image or")}</p>
                                            { !selectedFile && (
                                                <button>Upload</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                    </div>
                    <div className={styles.toast_buttons}>
                        <button className={styles.toast_close} onClick={() => {
                            setSettings(false)
                            toast.dismiss(t.id)
                        }}>
                            Close
                        </button>
                        <button className={styles.toast_apply} onClick={() => {
                            settingsIcon(selectedFile)
                            setSettings(false)
                            toast.dismiss(t.id)
                        }}>
                            apply
                        </button>
                    </div>
                </span>
            </span>
        }, {
            duration: Infinity,
            position: "bottom-left"
        })
    }

    const notify = (msg: any, space: boolean = false) => {
        //toast("here is your toast")
        toast((t) => (
            <span className={styles.toast}>
                <div className={styles.toast_main} onClick={() => {
                    if(space) {
                        changeLocationSpace(msg.to)
                    } else {
                        changeLocationUser(msg.from)
                    }
                }}>
                    <UserIcon width={32} height={32} className={styles.toast_user_icon} userId={msg.from} />
                    <div>
                        <p className={styles.toast_user_name}>{space ? `${msg.space_name} - ${msg.from_user_name}`  : msg.from_user_name}</p>
                        <div className={styles.toast_message}>
                            <p>{msg.body}</p>
                        </div>
                    </div>
                </div>
                <button className={styles.toast_close} onClick={() => toast.dismiss(t.id)}>
                    Close
                </button>
            </span>
        ));
    }

    const addMessage = (msg: any, space: boolean = false) => {
        msg.locationType = space ? "space" : "user"
        //const date = new Date(msg.timestamp).getTime() + ( 1000*60*60*9 ) 
        //msg.timestamp = date
        setMessages((messages:any) => [ ...messages, msg])
    }

    const changeLocationUser = async (id : number) => {
        setLocationType("user")
        setLocation(String(id))
        const res = await getUserChatHistory(id)
        setMessages(res)
        console.log(res)
    }
    const changeLocationSpace = async (id : number) => {
        setLocationType("space")
        setLocation(String(id))
        const res = await getSpaceChatHistory(id)
        setMessages(res)
    }
    const sendMessageUser = async (to : number, body : string, path: string) => {
        //console.log(to, body)
        //return
        const res = await isLoginAndLogin()
        if(res) {
            socket.emit("socket_send_message_to_user", {"body":body,"file":path,"to":to,"token":getToken()})
            return
        }
        router.replace("/login")
    }
    const sendMessageSpace = async (to : number, body : string, path: string) => {
        const res = await isLoginAndLogin()
        if(res) {
            socket.emit("socket_send_message_to_space", {"body":body,"file":path,"to":to,"token":getToken()})
        }
    }
    const sendMessageEasy = async (body : string, path: string) => {
        if(locationType == "user") {
            const res = await sendMessageUser(Number(location), body, path)
        }
        if(locationType == "space") {
            const res = await sendMessageSpace(Number(location), body, path)
        }
    }

    const joinSpace__ = async (name : string, key : string) => {
        setIsOpenModal(false)
        const res = await joinSpace(name, key)
        setSpaces((value:any)=> [...value, {"id":res.id, "name":res.name}])
    }
    const createSpace__ = async (name:string, key:string) => {
        setIsOpenModal(false)
        const res = await createSpace(name, key)
        setSpaces((value:any)=> [...value, {"id":res.id, "name":res.name}])
    }
    const createSpace_ = async () => {
        setIsOpenModal(true)
        setModalType("createSpace")
        //const res = await createSpace("test","test")
        //setSpaces((value:any)=> [...value, {"id":res.id, "name":res.name}])
        //console.log(res)
    }
    const deleteUser__ = async (user: string) => {
        const res = await UnRequestChat(user)
        socket.emit("socket_un_request_reply", {"name":user,"token":getToken()})
        reload()
        //const rl = async () => {
        //    const res = await getRequesting()
        //    setRequesting(res)
        //}
        //rl()
    }
    const addUser__ = async (user: string) => {
        setIsOpenModal(false)
        const res = await requestChat(user)
        socket.emit("socket_request_reply", {"name":user,"token":getToken()})
        reload()
        //const rl = async () => {
        //    const res = await getRequesting()
        //    setRequesting(res)
        //}
        //rl()
    }
    const addUser_ = async () => {
        setIsOpenModal(true)
        setModalType("addUser")
    }

    useEffect(() => {
        const l = async () => {
            const res = await isLoginAndLogin()
            if(!res) {
                router.replace("/login")
                return
            }
            if(!getToken(true)) return
            const token = getToken(true)
            if(token) {
                const id = parseJwt(token).sub
                setMyUserId(id)
                setIsJoinRoom(true)
                socket.emit("socket_join_room", {room:String(id),token:token})
            }
        }
        l()
    },[])

    useEffect(() => {
        const fl = async () => {
            const res = await getFriendsList()
            setFriends(res)
        }
        fl()
    },[])
    useEffect(() => {
        const sl = async () => {
            const res = await getSpaceList()
            setSpaces(res)
        }
        sl()
    },[])
    useEffect(() => {
        const rl = async () => {
            const res = await getRequester()
            setRequesters(res)
        }
        rl()
    },[])
    useEffect(() => {
        const rl = async () => {
            const res = await getRequesting()
            setRequesting(res)
        }
        rl()
    },[])

    const reload = async () => {
        console.log("reload")
        const fl = async () => {
            const res = await getFriendsList()
            setFriends(res)
        }
        fl()
        const rl = async () => {
            const res = await getRequester()
            setRequesters(res)
        }
        rl()
        const rl_ = async () => {
            const res = await getRequesting()
            setRequesting(res)
        }
        rl_()
    }

    useEffect(() => {
        socket.on("message_from_user", (msg: any) => {
            addMessage(msg)
            notify(msg)
        })
        socket.on("message_to_user", (msg:any) => {
            addMessage(msg)
        })

        socket.on("message_from_space", (msg: any) => {
            addMessage(msg, true)
            notify(msg, true)
        })
        socket.on("message_to_space", (msg: any) => {
            addMessage(msg, true)
        })

        socket.on("chat_request_replay", (msg: any) => {
            console.log("chat_request_replay")
            reload()
        })

        socket.on("chat_un_request_replay", (msg: any) => {
            console.log("chat_un_request_replay")
            reload()
        })
    },[])
    return (
        <>
            <Modal
                className={styles.modal}
                style={{
                    overlay: {
                        backgroundColor: "rgb(0 0 0 / 15%)",
                        zIndex: 10
                    }
                    ,content: {

                    }
                }}
                isOpen={isOpenModal}
                onRequestClose={() => setIsOpenModal(false)}
                >
                    <div className={styles.modal_}>
                        { modalType == "createSpace" && <CreateSpace
                            create={createSpace__}
                            join={joinSpace__}
                            cancel={() => {
                                setIsOpenModal(false);
                            }}
                        />}
                        { modalType == "addUser" && <CreateUser
                            add={addUser__}
                            cancel={() => {
                                setIsOpenModal(false);
                            }}
                        />}
                    </div>
            </Modal>
            <div className={styles._}>
                <Header
                    goHome={goHome}
                    settings={showSettings}
                />
                <div style={{display: "flex"}}>
                    <Bar
                        friends={friends}
                        changeUser={changeLocationUser}
                        changeSpace={changeLocationSpace}
                        location={location}
                        locationType={locationType}
                        createSpace={createSpace_}
                        spaces={spaces}
                        addUser={addUser_}
                        socket={socket}
                        reload={reload}
                    />
                    { location &&
                        <div style={{width: "100%"}}>
                            <ChatHeader />
                            <div className={styles.chat}>
                                <Chat
                                    messages={messages}
                                    location={location}
                                    locationType={locationType}
                                />
                                <ChatInput
                                    sendMessage={sendMessageEasy}
                                    location={[location, locationType]}
                                />
                            </div>
                        </div>
                    }
                    { !location && <div style={{width: "100%"}}>
                            { (!requesters.length && !requesting.length) && <div style={{width: "100%",display: "flex", alignItems: "center", justifyContent: "center"}}><h1 style={{color: "#ccc"}}>Selected chat</h1></div>}
                            { requesters.length > 0 && <div className={styles.requests} >
                                    <div style={{width: "100%",display: "flex", alignItems: "center", justifyContent: "center"}}><h1 style={{color: "#ccc"}}>request</h1></div>
                                    { requesters.map((requester:any, i:number)=>(
                                        <div className={styles.request} key={i}>
                                            <div className={styles.user_data}>
                                                {/*<div className={styles.user_icon}></div>*/}
                                                <UserIcon width={38} height={38} className={styles.user_icon} userId={requester.id} />
                                                <p>{requester.name}</p>
                                            </div>
                                            <button onClick={() => addUser__(requester.name)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-plus" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00b341" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                    <line x1="12" y1="5" x2="12" y2="19" />
                                                    <line x1="5" y1="12" x2="19" y2="12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>}
                            { requesting.length > 0 && <div className={styles.requests}>
                                <div style={{width: "100%",display: "flex", alignItems: "center", justifyContent: "center"}}><h1 style={{color: "#ccc"}}>requesting</h1></div>
                                { requesting.map((requester:any, i:number)=>(
                                        <div className={styles.request} key={i}>
                                            <div className={styles.user_data}>
                                                {/*<div className={styles.user_icon}></div>*/}
                                                <UserIcon width={38} height={38} className={styles.user_icon} userId={requester.id} />
                                                <p>{requester.name}</p>
                                            </div>
                                            <button onClick={() => deleteUser__(requester.name)}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-x" width="28" height="28" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#fd0061" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                                                    <line x1="18" y1="6" x2="6" y2="18" />
                                                    <line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>}
                        </div>}
                </div>
            </div>
            <Toaster
                position="bottom-right"
                reverseOrder={false}
                containerStyle={location != "" ? {
                    //position: "absolute",
                    bottom: 94
                }: {}}
            />
        </>
    )
}

export default Home