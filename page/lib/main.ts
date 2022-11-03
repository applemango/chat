import axios from "axios";
import { useRouter } from "next/router";
import { getToken, isLoginAndLogin, logout } from "./token"

export function getUrl (url: string, useToken: boolean = false): string {
    if(process.browser) {
        const and = url.indexOf("?") + 1 ? "&jwt=" : "?jwt="
        if(useToken) {
            const token = getToken()
            if(!token) {
                return ""
            }
            const host = location.host.split(':')[0];
            return `${location.protocol}//${host}:5000/${url}${useToken ? and + token : ""}`
        }
        const host = location.host.split(':')[0];
        return `${location.protocol}//${host}:5000/${url}`
    }
    return ""
}

export async function get(url: string,header: any, login: boolean, token:boolean) {
    if(login) {
        const res = await isLoginAndLogin()
        if(!res) {
            throw "token not found"
        }
    }
    try {
        let head = header
        if(token) {
            head["Authorization"] = "Bearer "+getToken()
        }
        const res = await axios.get(
            url, {
                headers: head
            }
        )
        return res
    } catch (e:any) {
        if (e.response.status == 401) {
            const res = await logout()
            //const router = useRouter()
            //router.replace("/login")
        }
        console.error(e)
        throw e
    }
}

export async function post(url: string,header: any, body: any, login: boolean, token:boolean) {
    if(login) {
        const res = await isLoginAndLogin()
        if(!res) {
            throw "token not found"
        }
    }
    try {
        let head = header
        if(token) {
            head["Authorization"] = "Bearer "+getToken()
        }
        const res = await axios.post(
            url, {
                body: JSON.stringify(body)
            }, {
                headers: head
            }
        )
        return res
    } catch (e:any) {
        if (e.response.status == 401) {
            const res = await logout()
            //const router = useRouter()
            //router.replace("/login")
        }
        console.error(e)
        throw e
    }
}