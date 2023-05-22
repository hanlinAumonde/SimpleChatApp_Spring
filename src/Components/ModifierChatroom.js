import React, {useContext, useEffect, useState} from "react";
import properties from "../properties";
import CsrfTokenContext from "../CsrfTokenContext";
import {useParams} from "react-router-dom";
import {Form} from "react-bootstrap";
import Accordion from "react-bootstrap/Accordion";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";

export default function ModifierChatroom(){
    const csrfToken = useContext(CsrfTokenContext);
    let { chatroomId } = useParams();

    const [chatroom, setChatroom] = useState({});
    const [updatedChatroom, setUpdatedChatroom] = useState({
        "startDate": "",
        "duration": 1
    });
    const [usersInvited, setUsersInvited] = useState([]);
    const [usersNotInvited, setUsersNotInvited] = useState([]);

    const getChatroom = async () => {
        try{
            const response = await fetch(properties.ChatroomApi + chatroomId, {
                "credentials": "include",
                "headers": {
                    "X-XSRF-TOKEN": csrfToken
                }
            });
            const chatroom = await response.json();
            if(response.status === 401 || response.status === 404){
                window.location.href = properties.LoginApi;
            }
            setChatroom(chatroom);
        }
        catch(error){
            console.log(error);
        }
    }

    const getUsersInvited = async () => {
        try{
            const response = await fetch(properties.ChatroomApi + chatroomId + "/usersInvited", {
                "credentials": "include",
                "headers": {
                    "X-XSRF-TOKEN": csrfToken
                }
            });
            const usersInvited = await response.json();
            if(response.status === 401){
                window.location.href = properties.LoginApi;
            }
            setUsersInvited(usersInvited);
        }catch (error){
            console.log(error);
        }
    }

    const getUsersNotInvited = async () => {
        try{
            const response = await fetch(properties.ChatroomApi + chatroomId + "/usersNotInvited", {
                "credentials": "include",
                "headers": {
                    "X-XSRF-TOKEN": csrfToken
                }
            });
            const usersNotInvited = await response.json();
            if(response.status === 401){
                window.location.href = properties.LoginApi;
            }
            setUsersNotInvited(usersNotInvited);
        }catch (error) {
            console.log(error);
        }
    }

    const inviteUser = async (user) => {
        try{
            const response = await fetch(properties.ChatroomApi + chatroomId + "/addUserInvited", {
                "credentials": "include",
                "headers": {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken
                },
                body: JSON.stringify({
                    "id": user.id,
                    "lastName": user.lastName,
                    "firstName": user.firstName,
                    "mail": user.mail
                }),
                "method": "POST"
            });
            if(response.status === 401){
                window.location.href = properties.LoginApi;
            }
            await getUsersInvited();
            await getUsersNotInvited();
        }catch (error) {
            console.log(error);
        }
    }

    const uninviteUser = async (userId) => {
        try{
            const response = await fetch(properties.ChatroomApi + chatroomId + "/userInvited/" + userId, {
                "credentials": "include",
                "headers": {
                    "X-XSRF-TOKEN": csrfToken
                },
                "method": "DELETE"
            });
            if(response.status === 401){
                window.location.href = properties.LoginApi;
            }else if (response.status === 409){
                alert("Erreur lors de la suppression de l'utilisateur");
            }
            await getUsersInvited();
            await getUsersNotInvited();
        }catch (error) {
            console.log(error);
        }
    }

    const updateChatroom = async () => {
        try{
            const response = await fetch(properties.ChatroomApi + chatroomId, {
                "credentials": "include",
                "headers": {
                    "Content-Type": "application/json",
                    "X-XSRF-TOKEN": csrfToken
                },
                body: JSON.stringify({
                    "titre": chatroom.titre,
                    "description": chatroom.description,
                    "usersInvited": usersInvited,
                    "startDate": updatedChatroom.startDate,
                    "duration": updatedChatroom.duration
                }),
                "method": "PUT"
            });
            if(response.status === 401){
                window.location.href = properties.LoginApi;
            }else if (response.status === 409){
                alert("Erreur lors de la modification de la chatroom");
            }
            window.location.reload();
        }catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        getChatroom();
        getUsersInvited();
        getUsersNotInvited();
    },[csrfToken]);

    return(
        <main>
            <h1>Modifier Chatroom - {chatroom.id}</h1>
            <Form>
                <Form.Group controlId="formBasicTitre">
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Titre :</Accordion.Header>
                            <Accordion.Body>
                            <Form.Label>Titre :</Form.Label>
                            <Form.Control type="text" placeholder={chatroom.titre}
                                  value={chatroom.titre} onChange={(event) => setChatroom({...chatroom, titre: event.target.value})}/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Form.Group>
                <Form.Group controlId="formBasicDescription">
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Description :</Accordion.Header>
                            <Accordion.Body>
                            <Form.Label>Description :</Form.Label>
                            <Form.Control type="text" placeholder={chatroom.description}
                                    value={chatroom.description} onChange={(event) => setChatroom({...chatroom, description: event.target.value})}/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Form.Group>
                <Accordion>
                    <Accordion.Item eventKey="0">
                    <Accordion.Header>Utilisateurs invités :</Accordion.Header>
                        <Accordion.Body>
                        <ListGroup>
                            {usersInvited.map((user) => (
                                <ListGroup.Item key={user.id}>
                                    <div>{user.firstName + " " + user.lastName}</div>
                                    <Button variant="danger" onClick={() => uninviteUser(user.id)}>Supprimer</Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                <Accordion>
                    <Accordion.Item eventKey="0">
                    <Accordion.Header>Utilisateurs non invités :</Accordion.Header>
                        <Accordion.Body>
                        <ListGroup>
                            {usersNotInvited.map((user) => (
                                <ListGroup.Item key={user.id}>
                                    <div>{user.firstName + " " + user.lastName}</div>
                                    <Button variant="success" onClick={() => inviteUser(user)}>Ajouter</Button>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
                <Form.Group controlId="formBasicStartDate">
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>StartDate :</Accordion.Header>
                            <Accordion.Body>
                            <Form.Label>StartDate :</Form.Label>
                            <Form.Control type="datetime-local"
                                          min={new Date().toISOString().slice(0,16)}
                                          value={updatedChatroom.startDate}
                                          onChange={(event) => setUpdatedChatroom({...updatedChatroom, startDate: event.target.value+":00"})}/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Form.Group>
                <Form.Group controlId="formBasicDuration">
                    <Accordion>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>Durée :</Accordion.Header>
                            <Accordion.Body>
                            <Form.Label>Durée :</Form.Label>
                            <Form.Control type="number" placeholder={chatroom.duration} min={1} max={30}
                                    value={updatedChatroom.duration} onChange={(event) => setUpdatedChatroom({...updatedChatroom, duration: parseInt(event.target.value)})}/>
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Form.Group>
            <Button variant="primary" onClick={() => updateChatroom()}>Modifier</Button>
            </Form>
        </main>
    );
}