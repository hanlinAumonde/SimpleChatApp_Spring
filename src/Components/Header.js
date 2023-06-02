import React from "react";
import styles from "../Styles/header.module.css"

/**
 * Composant de header dans la page
 */
export default function Header(){
    return(
        <>
            <div className={styles.cover}></div>
            <header className={styles.header}>
                <div className={styles.container}>
                    <h1>SR03 Chat Application - User Platform</h1>
                </div>
            </header>
        </>
    );
}