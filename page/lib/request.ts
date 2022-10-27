import axios from "axios"
import { get, getUrl, post } from "./main"
import { getToken, isLoginAndLogin } from "./token"

export const getRequester = async () => {
    try {
        const res = await get(
            getUrl("friends/requester")
            ,{}, true, true
        )
        return res.data.data
    } catch (e) {
        console.log(e)
        return false
    }
}

export const getRequesting = async () => {
    try {
        const res = await get(
            getUrl("friends/requesting")
            ,{}, true, true
        )
        return res.data.data
    } catch (e) {
        console.log(e)
        return false
    }
}

export const requestChat = async (username: string) => {
    try {
        const res = await post(
            getUrl(`friends/request/${username}`)
            ,{}, {}, true, true
        )
        return res.data.data
    } catch (e) {
        console.log(e)
        return false
    }
}

export const UnRequestChat = async (username: string) => {
    try {
        const res = await post(
            getUrl(`friends/unrequest/${username}`)
            ,{}, {}, true, true
        )
        return res.data.data
    } catch (e) {
        console.log(e)
        return false
    }
}

export const deleteFriends = async (friends_id: number) => {
    const lRes = await isLoginAndLogin()
    if(!lRes) {
        throw "token not found"
    }
    try {
        const res = await axios.delete(getUrl(`friends/delete/${friends_id}`),{
            headers: {
                "Authorization": "Bearer "+getToken()
            }
        })
        return res.data
    } catch (e) {
        console.log(e)
        return undefined
    }
}