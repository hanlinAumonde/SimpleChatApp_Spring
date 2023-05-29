import React, {useContext, useEffect, useState} from "react";
import properties from "../properties.json";
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

    const modInputCheck = () => {
        const regex = /[<>/\\{}[\]()=+*?!@#$%^&|~`;]/;
        const dateStringFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
        if((chatroom.titre !== "" && regex.test(chatroom.titre)) || (chatroom.description !== "" && regex.test(chatroom.description))){
            return "Le contenu de titre et/ou description ne doit pas contenir des caractères spéciaux";
        }
        if(chatroom.titre !== "" && chatroom.titre.length > 20){
            return "Longueur de titre doit être egal ou plus petit que 20";
        }
        if(chatroom.description !== "" && chatroom.description.length > 100){
            return "Longueur de description doit être egal ou plus petit que 100";
        }
        if(usersInvited.length < 1){
            return "Vous devez inviter au moins un utilisateur";
        }
        if(updatedChatroom.startDate !== "" && !dateStringFormat.test(updatedChatroom.startDate)){
            return "Format de date invalide";
        }
        if(updatedChatroom.duration < 1 || updatedChatroom.duration > 30){
            return "La durée doit être entre 1 - 30 jours";
        }
        return "check passed";
    }

    const inviteUser = async (user) => {
        try{
            const response = await fetch(properties.ChatroomApi + chatroomId + "/users/invited/", {
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
                alert("Error code : " + response.status + " - Reason : Not logged in");
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
            const response = await fetch(properties.ChatroomApi + chatroomId + "/users/invited/" + userId, {
                "credentials": "include",
                "headers": {
                    "X-XSRF-TOKEN": csrfToken
                },
                "method": "DELETE"
            });
            if(response.status === 401){
                alert("Error code : " + response.status + " - Reason : Not logged in");
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
            const check = modInputCheck();
            if(check !== "check passed"){
                alert(check);
            }else {
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
                if (response.status === 401) {
                    alert("Error code : " + response.status + " - Reason : Not logged in");
                    window.location.href = properties.LoginApi;
                } else if (response.status === 409) {
                    alert("Erreur lors de la modification de la chatroom");
                } else {
                    alert("Chatroom modifiée avec succès");
                }
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

    const getChatroom = async () => {
        try{
            const response = await fetch(properties.ChatroomApi + chatroomId, {
                "credentials": "include",
                "headers": {
                    "X-XSRF-TOKEN": csrfToken
                }
            });
            const chatroom = await response.json();
            if(response.status === 401){
                alert("Error code : " + response.status + " - Reason : Not logged in");
                window.location.href = properties.LoginApi;
            }else if(response.status === 404){
                alert("Chatroom introuvable");
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
            const response = await fetch(properties.ChatroomApi + chatroomId + "/users/invited", {
                "credentials": "include",
                "headers": {
                    "X-XSRF-TOKEN": csrfToken
                }
            });
            const usersInvited = await response.json();
            if(response.status === 401){
                alert("Error code : " + response.status + " - Reason : Not logged in");
                window.location.href = properties.LoginApi;
            }else if(response.status === 403){
                alert("Error code : " + response.status + " - Reason : Forbidden");
                window.location.href = properties.LoginApi;
            }
            setUsersInvited(usersInvited);
        }catch (error){
            console.log(error);
        }
    }

    const getUsersNotInvited = async () => {
        try{
            const response = await fetch(properties.ChatroomApi + chatroomId + "/users/non-invited", {
                "credentials": "include",
                "headers": {
                    "X-XSRF-TOKEN": csrfToken
                }
            });
            const usersNotInvited = await response.json();
            if(response.status === 401){
                alert("Error code : " + response.status + " - Reason : Not logged in");
                window.location.href = properties.LoginApi;
            }else if(response.status === 403){
                alert("Error code : " + response.status + " - Reason : Forbidden");
                window.location.href = properties.LoginApi;
            }
            setUsersNotInvited(usersNotInvited);
        }catch (error) {
            console.log(error);
        }
    }

    const handleModifier = (event) => {
        event.preventDefault();
        updateChatroom();
    }

    const handleInvite = (user) => {
        return async (event) => {
            event.preventDefault();
            await inviteUser(user.id);
        }
    }

    const handleUninvite = (userID) => {
        return async (event) => {
            event.preventDefault();
            await uninviteUser(userID);
        }
    }

    return(
        <main style={{backgroundColor: 'white',border: '2px solid #ccc', padding: '10px',boxShadow: '0 4px 6px #39373D'}}>
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
                                    <Button variant="danger" onClick={handleUninvite(user.id)}>Supprimer</Button>
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
                                    <Button variant="success" onClick={handleInvite(user)}>Ajouter</Button>
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
            <Button variant="primary" onClick={handleModifier}>Modifier</Button>
            </Form>
        </main>
    );
}