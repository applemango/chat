import { get, getUrl, post } from "./main"

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