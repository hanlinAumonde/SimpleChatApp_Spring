import React, {useContext, useEffect, useRef, useState} from "react";
import properties from "../properties.json";
import LoginContext from "../LoginContext";
import CsrfTokenContext from "../CsrfTokenContext";
import Container from "react-bootstrap/Container";
import {Badge, Col, ListGroup, Row, Form, Button, CloseButton} from "react-bootstrap";
import ScrollBox from "../Components/ScrollBox";
import styles from "../Styles/Chatroom.module.css";
import {useParams,useLocation} from "react-router-dom";

export default function Chatroom(){
    const loggedUser = useContext(LoginContext);
    const csrfToken = useContext(CsrfTokenContext);
    const webSocketClient = useRef(null);
    let { chatroomId } = useParams();
    const currentPath = useLocation();

    const [allUsersInChatroom, setAllUsersInChatroom] = useState([]);
    const [msgList, setMsgList] = useState([]);
    //e.g. : msgList =  [{index: 1, user: {id: 1, username: "user1 user1"}, messageType: 0, message: "hello" , timestamp : "18:00", sender: 1}]
    //sender = 0 c'est à dire que le message a été envoyé par les autres utilisateurs
    //messageType = 0 c'est à dire que le message est un message texte normal, messageType = 1/2 c'est à dire que le message est un message de connexion/déconnexion
    const [MsgSend, setMsgSend] = useState("");

    const inputMsgCheck = (message) => {
        if(message === ""){
            alert("Le message ne doit pas être vide!");
            return false;
        }
        const regex = /[<>/\\{}[\]=+*@#$%^&|~`;]/;
        if(regex.test(message)){
            alert("Le message ne doit pas contenir les caractères suivants : <>/\\{}[]+=*@#$%^&|~`;");
            return false;
        }
        return true;
    }

    const sendMsgToServer = (message) => {
        const checkRes = inputMsgCheck(message);
        if (webSocketClient.current !== null && checkRes){
            webSocketClient.current.send(JSON.stringify(message));
        }else if(!checkRes){
            setMsgSend("");
        }else{
            alert("Connection Erreur!");
            window.location.reload();
        }
    }
    const handleSendMessage = (event) => {
        event.preventDefault();
        sendMsgToServer(MsgSend);
    }

    useEffect(() => {
        const getAllUsersInChatroom = async () => {
            try{
                const response = await fetch(properties.ChatroomApi + chatroomId + "/users",{
                    "credentials": "include",
                    "headers": {
                        "X-XSRF-TOKEN": csrfToken
                    }
                });
                const allUsersInChatroom = await response.json();
                if(response.status === 401 || response.status === 500){
                    alert("Error code :" + response.status);
                    window.location.href = properties.LoginApi;
                }
                if(allUsersInChatroom.find(user => user.id === loggedUser.id)){
                    allUsersInChatroom.forEach(user => {
                        if(!("isConnecting" in user)) {
                            //initialiser le champ isConnecting
                            if (user.id === loggedUser.id) {
                                user.isConnecting = 1;
                            } else {
                                user.isConnecting = 0;
                            }
                        }
                    });
                    setAllUsersInChatroom(allUsersInChatroom);
                }else{
                    alert("Vous n'êtes pas autorisé à accéder à cette Chatroom");
                    window.location.href = properties.LoginApi;
                }
            }
            catch(error){
                console.log(error);
            }
        }
        getAllUsersInChatroom();
        const timer = setInterval(getAllUsersInChatroom,1000*60*5);
        return () => clearInterval(timer);
    },[chatroomId, csrfToken, loggedUser]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            if(webSocketClient.current !== null)
                webSocketClient.current.close();
        }

        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        }
    });

    useEffect(() => {
        const initWebSocket = () => {
            if(webSocketClient.current === null && allUsersInChatroom.length !== 0){
                webSocketClient.current = new WebSocket(properties.webSocketApi + chatroomId + "/user/" + loggedUser.id);

                webSocketClient.current.onopen = () => {
                    console.log("WebSocket Client a été connecté");
                }

                webSocketClient.current.onclose = () => {
                    console.log("WebSocket Client a été déconnecté");
                    //retourner à la page de acceuil du user:
                    window.location.href = properties.LoginApi;
                }

                webSocketClient.current.onmessage = (event) => {
                    let message = JSON.parse(event.data);

                    if(message.messageType === 1) {
                        const newUsers = allUsersInChatroom.map(user =>
                            user.id === message.user.id ? {...user, isConnecting: 1} : user
                        );
                        setAllUsersInChatroom(newUsers);
                    }else if(message.messageType === 2) {
                        const newUsers = allUsersInChatroom.map(user =>
                            user.id === message.user.id ? {...user, isConnecting: 0} : user
                        );
                        setAllUsersInChatroom(newUsers);
                    }


                    if(message.user.id === loggedUser.id){
                        message = {...message, sender : 1};
                    } else{
                        message = {...message, sender : 0};
                    }
                    setMsgList(prevMsgs => [...prevMsgs, {index: prevMsgs.length, ...message}]);
                }

                webSocketClient.current.onerror = (event) => {
                    console.log("WebSocket Client a rencontré une erreur : ", event);
                    window.location.reload();
                }
            }
            /*
            else{
                alert("Vous êtes déjà connecté à la Chatroom, vous pouvez rafraichir la page pour la réinitialiser");
            }
            */
        }
        initWebSocket();
    },[chatroomId, loggedUser, allUsersInChatroom]);

    useEffect(() => {
        return () => {
            if(webSocketClient.current !== null)
                webSocketClient.current.close();
        }
    },[currentPath]);

    if(!allUsersInChatroom || allUsersInChatroom.length === 0)
        return <main><h1>Loading chatroom ... </h1></main>
    else
        return(
            <main className={styles.main}>
                <h2 className={styles.h2}>
                    <div className={styles.div}>
                    <span>Chatroom - {chatroomId}</span>
                    <span><CloseButton onClick={() => window.location.href = "/"}/></span>
                    </div>
                </h2>
                <Container className={styles.container}>
                    <Row style={{height:'100%'}}>
                        <Col xs={9} style={{height:'100%'}}>
                            <ScrollBox className={styles.scrollBox} messages={msgList}/>
                        </Col>
                        <Col xs={3} style={{height:'100%'}}>
                            <ListGroup className={styles.listGroup}>
                                    <Badge bg="primary">
                                        Users online:
                                    </Badge>
                                {allUsersInChatroom.map(
                                    userInChatroom =>
                                        userInChatroom.isConnecting === 1?
                                        <ListGroup.Item>
                                            <p>{userInChatroom.firstName + "" + userInChatroom.lastName}</p>
                                            <p>{userInChatroom.mail}</p>
                                        </ListGroup.Item>
                                            : null
                                )}
                                    <Badge bg="primary">
                                        Users offline:
                                    </Badge>
                                {allUsersInChatroom.map(
                                    userInChatroom =>
                                        userInChatroom.isConnecting === 0?
                                            <ListGroup.Item>
                                                <p>{userInChatroom.firstName + " " + userInChatroom.lastName}</p>
                                                <p>{userInChatroom.mail}</p>
                                            </ListGroup.Item>
                                            : null
                                )}
                            </ListGroup>
                        </Col>
                    </Row>
                </Container>
                <Form onSubmit={handleSendMessage} className={styles.form}>
                    <Form.Group className="mb-3" controlId="formBasicMessageSend">
                        <Container>
                            <Row>
                            <Col xs={11}>
                                <Form.Control type="text" value={MsgSend} onChange={(event) => setMsgSend(event.target.value)} />
                                <Form.Text className="text-muted">
                                    Ne pas envoyer les caractères spéciaux
                                </Form.Text>
                            </Col>
                            <Col xs={1}><Button variant="primary" type="submit">Send</Button></Col>
                            </Row>
                        </Container>
                    </Form.Group>
                </Form>
            </main>
        );
}