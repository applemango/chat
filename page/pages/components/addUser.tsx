import styles from "./sass/createSpace.module.scss"
import { useState } from "react"

const addUser = ({
    add,
    cancel
}:{
    add: Function
    cancel: Function
}) => {
    const [name, setName] = useState("")
    return <div className={styles.main}>
        <p>add user</p>
        <input placeholder="user name" className={styles.input} type="text" value={name} onChange={(e:any) => setName(e.target.value)}/>
        <div className={styles.buttons}>
            <button className={styles.button} onClick={() => cancel()}>cancel</button>
            <button className={styles.button} onClick={() => {
                setName("")
                add(name)
            }}>add</button>
        </div>
    </div>
}
export default addUser