import React, {useContext, useEffect, useState} from "react";
import properties from "../properties.json";
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import CsrfTokenContext from "../CsrfTokenContext";
import Accordion from "react-bootstrap/Accordion";
import {Badge} from "react-bootstrap";
import Pagination from "../Components/Pagination";

export default function PlanifierChatroom(){
    //le contexte du token csrf
    const csrfToken = useContext(CsrfTokenContext);

    //les variables pour les informations de la chatroom
    const [titre, setTitre] = useState("");
    const [description, setDescription] = useState("");
    const [users, setUsers] = useState([]);
    const [usersPage, setUsersPage] = useState(0);
    const [usersTotalPages, setUsersTotalPages] = useState(0);

    const [usersInvited, setUsersInvited] = useState([]);
    const [startDate, setStartDate] = useState("");
    const [duration, setDuration] = useState(1);

    //le message de résultat de l'ajout de chatroom
    const [resultMsg, setResultMsg] = useState("");

    /**
     * Fonction qui permet de check les inputs
     */
    const inputCheck = (titre,description,duration,startDate,usersInvited) => {
        //le contenu de titre et description ne doit pas contenir des caractères spéciaux : < > / \ { } [ ] ( ) = + * ? ! @ # $ % ^ & | ~ ` ;
        const regex = /[<>/\\{}[\]()=+*?!@#$%^&|~`;]/;
        const dateStringFormat = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;
        if(regex.test(titre) || regex.test(description)){
            return "Le contenu de titre et/ou description ne doit pas contenir des caractères spéciaux";
        }
        if(titre.length > 20){
            return "Longueur de titre doit être egal ou plus petit que 20";
        }
        if(description.length > 100){
            return "Longueur de description doit être egal ou plus petit que 100";
        }
        if(usersInvited.length < 1){
            return "Vous devez inviter au moins un utilisateur";
        }
        if(!dateStringFormat.test(startDate)){
            return "Format de date invalide";
        }
        if(duration < 1 || duration > 30){
            return "La durée doit être entre 1 - 30 jours";
        }
        if(titre === "" || description === "" || duration === ""){
            return "Les champs ne doivent pas être vide";
        }
        return "check passed";
    }

    /**
     * Fonction qui permet d'ajouter une chatroom
     */
    const addChatroom = async (titre,description,duration,startDate,usersInvited) => {
        try {
            let inputCheckResult = inputCheck(titre,description,duration,startDate,usersInvited);
            if (inputCheckResult !== "check passed") {
                setResultMsg(inputCheckResult);
            }else{
                const response = await fetch(properties.ChatroomApi, {
                    method: "POST",
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                        'X-XSRF-TOKEN': csrfToken
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        titre: titre,
                        description: description,
                        usersInvited: usersInvited,
                        startDate: startDate,
                        duration: duration
                    })
                });

                if(response.status === 401){
                    alert("Error code :" + response.status + " - Reason : " + response.statusText);
                    window.location.href = properties.LoginApi;
                } else if(response.status === 409) {
                    setResultMsg("chatroom already exist");
                } else {
                    setResultMsg("chatroom added");
                    window.location.reload();
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    /**
     * Fonction qui permet de traiter le click sur les checkbox
     */
    const handleUserCheckboxChange = (event, user) => {
        if (event.target.checked) {
            setUsersInvited(prevUsers => [...prevUsers, user]);
        } else {
            setUsersInvited(prevUsers => prevUsers.filter(u => u.id !== user.id));
        }
    };

    /**
     * Fonction qui permet de traiter le click sur les boutons de Submit
     */
    const handleSubmit = (event) => {
        event.preventDefault();
        addChatroom(titre,description,duration,startDate,usersInvited);
    }

    /**
     * Fonction qui permet d'effectuer la récupération des utilisateurs
     */
    useEffect(() => {
        const getUsers = async (page) => {
            try {
                const response = await fetch(properties.getAllOtherUsersApi+"?page=" + page,{
                    credentials: 'include',
                    headers: {
                        "X-XSRF-TOKEN": csrfToken
                    }
                });
                const users = await response.json();
                if(response.status === 401){
                    alert("Error code :" + response.status + " - Reason : " + response.statusText);
                    window.location.href = properties.LoginApi;
                }
                setUsers(users.content);
                setUsersTotalPages(users.totalPages);
            } catch (error) {
                console.log(error);
            }
        }
        getUsers(usersPage);
    }, [csrfToken,usersPage]);

    return (
        <Form onSubmit={handleSubmit} style={{backgroundColor: 'white',border: '2px solid #ccc', padding: '10px',boxShadow: '0 4px 6px #39373D'}}>
            <h1>Planifier votre chatroom :</h1>
            <Form.Group className="mb-3" controlId="formBasicTitre">
                <Form.Label>Titre de la chatroom :</Form.Label>
                <Form.Control type="titre" placeholder="Entrer le titre du Chatroom"
                    value={titre} onChange={(event) => setTitre(event.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicDescription">
                <Form.Label>Description de la chatroom :</Form.Label>
                <Form.Control type="description" placeholder="Entrer la description du Chatroom"
                    value={description} onChange={(event) => setDescription(event.target.value)} />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Choisir les utilisateurs pour l'invitation</Form.Label>
                <Accordion><Accordion.Item eventKey="0">
                    <Accordion.Header>Users list</Accordion.Header>
                    <Accordion.Body>
                    {users.map(
                        user => (
                            <Form.Check
                                type="checkbox"
                                label={user.firstName + " " + user.lastName}
                                key={user.id}
                                onChange={event => handleUserCheckboxChange(event, user)}
                            />
                        )
                    )}
                    <Pagination
                        currentPage={usersPage}
                        totalPages={usersTotalPages}
                        handlePrevious={() => setUsersPage(usersPage - 1)}
                        handleNext={() => setUsersPage(usersPage + 1)}
                    />
                    </Accordion.Body>
                </Accordion.Item></Accordion>
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicStartDate">
                <Form.Label>Choisir l'horaire/Depart :</Form.Label>
                <Form.Control
                    type="datetime-local"
                    min={new Date().toISOString().slice(0,16)}
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value + ":00")}
                />
            </Form.Group>
            <Form.Group className="mb-3" controlId="formBasicDuration">
                <Form.Label>La durée du chatroom (Days) :</Form.Label>
                <Form.Control type="number" min={1} max={30}
                    value={duration} onChange={(event) => setDuration(parseInt(event.target.value))} />
                <Form.Text className="text-muted">Entre 1 -30 jours</Form.Text>
            </Form.Group>
            {resultMsg ?
                <div>
                    {resultMsg === "chatroom added" ? <Badge bg="success">{resultMsg}</Badge> : <Badge bg="danger">{resultMsg}</Badge>}
                </div>
                : null
            }
            <Button variant="primary" type="submit">Submit</Button>
        </Form>
    );
}