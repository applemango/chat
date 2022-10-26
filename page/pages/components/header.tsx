import styles from "./sass/header.module.scss"
const Header = ({
    goHome
}:{
    goHome: Function
}) => {
    return <div className={styles.main} onClick={() => goHome()}>
        <div className={styles.left}>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-menu-2" width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#222" fill="none">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <line x1="3" y1="6" x2="21" y2="6" />
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </div>
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-3d-cube-sphere" width="44" height="44" viewBox="0 0 24 24" strokeWidth="1.5" stroke="#00b341" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M6 17.6l-2 -1.1v-2.5" />
                    <path d="M4 10v-2.5l2 -1.1" />
                    <path d="M10 4.1l2 -1.1l2 1.1" />
                    <path d="M18 6.4l2 1.1v2.5" />
                    <path d="M20 14v2.5l-2 1.12" />
                    <path d="M14 19.9l-2 1.1l-2 -1.1" />
                    <line x1="12" y1="12" x2="14" y2="10.9" />
                    <line x1="18" y1="8.6" x2="20" y2="7.5" />
                    <line x1="12" y1="12" x2="12" y2="14.5" />
                    <line x1="12" y1="18.5" x2="12" y2="21" />
                    <path d="M12 12l-2 -1.12" />
                    <line x1="6" y1="8.6" x2="4" y2="7.5" />
                </svg>
            </div>
            <p>Chat</p>
        </div>
        <div className={styles.search}>
            <div className={styles.input_box}>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-search" width="20" height="20" viewBox="0 0 24 24" strokeWidth="2" stroke="#424242" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <circle cx="10" cy="10" r="7" />
                    <line x1="21" y1="21" x2="15" y2="15" />
                </svg>
                <input className={styles.input} type="text" placeholder="search message, space, user" />
            </div>
        </div>
        <div className={styles.info}>
            <div className={styles.settings_icon}>
                <svg xmlns="http://www.w3.org/2000/svg" className="icon icon-tabler icon-tabler-settings" width="28" height="28" viewBox="0 0 24 24" strokeWidth="2" stroke="#9e9e9e" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
                    <path d="M10.325 4.317c.426 -1.756 2.924 -1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543 -.94 3.31 .826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.756 .426 1.756 2.924 0 3.35a1.724 1.724 0 0 0 -1.066 2.573c.94 1.543 -.826 3.31 -2.37 2.37a1.724 1.724 0 0 0 -2.572 1.065c-.426 1.756 -2.924 1.756 -3.35 0a1.724 1.724 0 0 0 -2.573 -1.066c-1.543 .94 -3.31 -.826 -2.37 -2.37a1.724 1.724 0 0 0 -1.065 -2.572c-1.756 -.426 -1.756 -2.924 0 -3.35a1.724 1.724 0 0 0 1.066 -2.573c-.94 -1.543 .826 -3.31 2.37 -2.37c1 .608 2.296 .07 2.572 -1.065z" />
                    <circle cx="12" cy="12" r="3" />
                </svg>
            </div>
            <div className={styles.user_icon}></div>
        </div>
    </div>
}
export default Header