import React from "react";
import {Alert, Card} from "react-bootstrap";
import styles from "../Styles/Chatroom.module.css";

/**
 * Composant de scrollbox dans la chatroom pour affichier les messages
 */
export default function ScrollBox({ messages }) {
    return (
        <div style={{ height: '100%', overflowY: 'auto' }}>
            {messages.map(
                msg =>
                    msg.messageType === 0 ?
                        <div style={msg.sender === 1 ? { display: "flex", justifyContent: "flex-end" } :
                            { display: "flex", justifyContent: "flex-start" }}>
                            <Card
                                bg={msg.sender === 1 ? "primary" : "light"}
                                key={msg.index}
                                text={msg.sender === 1 ? "white" : "dark"}
                                style={{ textAlign: "left" }}
                                className={styles.card}
                            >
                                <Card.Header>
                                    <div style={{ display: "flex", justifyContent: "space-between" , fontSize:'8px'}}>
                                        <span>{msg.user.username}</span>
                                        <span style={{minWidth:'8px'}}></span>
                                        <span>{msg.timestamp}</span>
                                    </div>
                                </Card.Header>
                                <Card.Text style={{fontSize:'18px',margin:'2px'}}>
                                    {msg.message.replace(/"/g,"")}
                                </Card.Text>
                            </Card>
                        </div>
                        :
                        <Alert key={msg.index} variant={msg.messageType === 1? "info" : "dark"}>
                            {msg.messageType === 1 ?
                                "User " + msg.user.username + " has joined the chatroom !" :
                                "User " + msg.user.username + " has left the chatroom !"
                            }
                        </Alert>
            )}
        </div>
    );
}