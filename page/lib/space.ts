import axios from "axios"
import { get, getUrl, post } from "./main"
import { getToken, isLoginAndLogin } from "./token"

export const createSpace = async (name: string, key: string) => {
    try {
        const res = await post(
            getUrl("space/create")
            ,{}, {name: name, key: key}, true, true
        )
        return res.data.data
    } catch (e) {
        console.log(e)
        return false
    }
}

export const joinSpace = async ( key: string, name: string | number) => {
    try {
        const res = await post(
            getUrl(`space/join/${name}`)
            ,{}, {key: key}, true, true
        )
        return res.data.data
    } catch (e) {
        console.log(e)
        return false
    }
}

export const getSpaceList = async () => {
    try {
        const res = await get(
            getUrl("space/list")
            ,{}, true, true
        )
        return res.data.data
    } catch (e) {
        console.log(e)
        return false
    }
}

export const leaveSpace = async (space_name: string) => {
    const lRes = await isLoginAndLogin()
    if(!lRes) {
        throw "token not found"
    }
    try {
        const res = await axios.delete(getUrl(`space/leave/${space_name}`),{
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