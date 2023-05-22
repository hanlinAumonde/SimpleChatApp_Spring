import React from "react";
import styles from "../Styles/footer.module.css"

export default function Footer(){
    return (
        <>
            <div className={styles.cover}></div>
            <footer className={styles.footer}>
                <div className={styles.container}>
                    <div>
                        <p>SR03 application de chat 2023</p>
                        <p>Hanlin_WU et Wassim_Gharbi</p>
                    </div>
                </div>
            </footer>
        </>
    );
}