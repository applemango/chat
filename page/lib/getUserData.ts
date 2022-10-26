import { get, getUrl } from "./main"

export const getFriendsList = async () => {
    try {
        const res = await get(
            getUrl("friends/list/"),{},true,true
        )
        return res.data.data
    } catch (e) {
        return false
    }
}