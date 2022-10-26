import { get, getUrl, post } from "./main"

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