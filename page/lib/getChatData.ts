import { get, getUrl } from "./main"

export const getUserChatHistory = async (id: string | number) => {
    try {
        const res = await get(
            getUrl(`chat/get/${id}`),{},true,true
        )
        return res.data.data
    } catch (e) {
        return false
    }
}

export const getSpaceChatHistory = async (id: string | number) => {
    try {
        const res = await get(
            getUrl(`space/chat/get/${id}`),{},true,true
        )
        return res.data.data
    } catch (e) {
        return false
    }
}