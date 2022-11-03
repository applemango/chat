import { get, getUrl } from "./main"

export const getSearchData = async (query: string) => {
    try {
        const res = await get(
            getUrl(`search?q=${query}`),{},true,true
        )
        return res.data.data
    } catch (e) {
        return false
    }
}