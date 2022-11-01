import axios from "axios"
import { getUrl } from './main'

import { isLoginAndLogin, getToken } from "./token"

export async function postMessageFile(selectedFile:File, space: boolean, spaceId?:number) {
    const login = await isLoginAndLogin()
    if(login) {
        try {
            const formData = new FormData();
            formData.append("file", selectedFile)
            const res = await axios.post(
                getUrl(space ? `post/fo;e/space/${spaceId}` : "post/file"),
                formData, {
                    headers: {
                        "Content-Type": "multipart/form-data;"
                        ,'Authorization': 'Bearer '+getToken()
                    }
                }
            )
            return res.data.data
        } catch (error: any) {
            return false
        }
    }
    return false
}