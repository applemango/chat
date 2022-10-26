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

    const goHome = () => {
        setLocation("")
        setLocationType("user")
        setMessages([])
    }

    const changeLocationUser = async (id : number) => {
        setLocationType("user")
        setLocation(String(id))
        const res = await getUserChatHistory(id)
        setMessages(res)
    }
    const changeLocationSpace = async (id : number) => {
        setLocationType("space")
        setLocation(String(id))
        const res = await getSpaceChatHistory(id)
        setMessages(res)
    }
    const sendMessageUser = async (to : number, body : string) => {
        //console.log(to, body)
        //return
        const res = await isLoginAndLogin()
        if(res) {
            socket.emit("socket_send_message_to_user", {"body":body,"to":to,"token":getToken()})
            return
        }
        router.replace("/login")
    }
    const sendMessageSpace = async (to : number, body : string) => {
        const res = await isLoginAndLogin()
        if(res) {
            socket.emit("socket_send_message_to_space", {"body":body,"to":to,"token":getToken()})
        }
    }
    const sendMessageEasy = async (body : string) => {
        if(locationType == "user") {
            const res = await sendMessageUser(Number(location), body)
        }
        if(locationType == "space") {
            const res = await sendMessageSpace(Number(location), body)
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
        /*socket.on('connect', function() {
            console.log("Connected")
            socket.emit('socket_connect', {data: 'I\'m connected!'});
        });*/
        /*socket.on("my_response", (msg: any) => {
            console.log(msg)
        })*/
        socket.on("message_from_user", (msg: any) => {
            if(location == String(msg.from) && locationType == "user") {
                setMessages((messages:any) => [ ...messages, msg])
            }
            //setMessages((messages:any) => [...messages, msg])
            //console.log("from",msg)
        })
        socket.on("message_to_user", (msg:any) => {
            if(location == String(msg.to) && locationType == "user") {
                setMessages((messages:any) => [ ...messages, msg])
            }
            //console.log("to",msg)
        })

        socket.on("message_from_space", (msg: any) => {
            if(location == String(msg.to) && locationType == "space") {
                setMessages((messages:any) => [...messages, msg])
            }
            //setMessages((messages:any) => [...messages, msg])
        })
        socket.on("message_to_space", (msg: any) => {
            if(location == String(msg.to) && locationType == "space") {
                setMessages((messages:any) => [...messages, msg])
            }
            //setMessages((messages:any) => [...messages, msg])
        })

        socket.on("chat_request_replay", (msg: any) => {
            reload()
        })

        socket.on("chat_un_request_replay", (msg: any) => {
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
                    />
                    { location &&
                        <div style={{width: "100%"}}>
                            <ChatHeader />
                            <div className={styles.chat}>
                                <Chat
                                    messages={messages}
                                />
                                <ChatInput
                                    sendMessage={sendMessageEasy}
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
                                                <div className={styles.user_icon}></div>
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
                                                <div className={styles.user_icon}></div>
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
        </>
    )
}

export default Home

/*
            <button onClick={() => {
                socket.emit("socket_message", "test")
            }}>test</button>

            <button onClick={() => {
                logout()
            }}>logout</button>

            <button onClick={() => {
                socket.emit("socket_join_room", {room:"1"})
            }}>join1</button>
            <button onClick={() => {
                socket.emit("socket_leave_room", {room:"1"})
            }}>leave1</button>

            <button onClick={() => {
                socket.emit("socket_join_room", {room:"2"})
            }}>join2</button>
            <button onClick={() => {
                socket.emit("socket_leave_room", {room:"2"})
            }}>leave2</button>

            <button onClick={() => {
                socket.emit("socket_send_message_to",{data:"hello,","to":"1",from:"2"})
            }}>send 1</button>
            <button onClick={() => {
                socket.emit("socket_send_message_to",{data:"world!","to":"2",from:"1"})
            }}>send 2</button>

            <button onClick={() => {
                if (getToken(true)) console.log(parseJwt(getToken(true)))
            }}>parse jwt</button>
*/
