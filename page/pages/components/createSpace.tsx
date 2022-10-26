import styles from "./sass/createSpace.module.scss"
import { useState } from "react"

const CreateSpace = ({
    create,
    join,
    cancel
}:{
    create: Function
    join: Function
    cancel: Function
}) => {
    const [name, setName] = useState("")
    const [key, setKey] = useState("")
    return <div className={styles.main}>
        <p>create space</p>
        <input placeholder="space name" className={styles.input} type="text" value={name} onChange={(e:any) => setName(e.target.value)}/>
        <input placeholder="space key" className={styles.input} type="text" value={key} onChange={(e:any) => setKey(e.target.value)}/>
        <div className={styles.buttons}>
            <button className={styles.button} onClick={() => cancel()}>cancel</button>
            <button className={styles.button} onClick={() => {
                setName("")
                setKey("")
                create(name, key)
            }}>create</button>
            <button className={styles.button} onClick={() => {
                setName("")
                setKey("")
                join(name, key)
            }}>join</button>
        </div>
    </div>
}
export default CreateSpace