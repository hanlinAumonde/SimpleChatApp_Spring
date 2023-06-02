import React, {useContext, useEffect, useState} from "react";
import properties from "../properties.json";
import {DropdownButton, Table, Dropdown} from "react-bootstrap";
import CsrfTokenContext from "../CsrfTokenContext";
import {Link} from "react-router-dom";
import LoginContext from "../LoginContext";
import Pagination from "../Components/Pagination";

export default function ListeChatroomOwned(){
    //le contexte pour le csrfToken et l'utilisateur connecté
    const csrfToken = useContext(CsrfTokenContext);
    const loggedUser = useContext(LoginContext);

    //les variables pour les chatrooms owned/joined et leurs pages
    const [chatroomsOwned, setChatroomsOwned] = useState([]);
    const [chatroomsOwnedPage, setChatroomsOwnedPage] = useState(0);
    const [chatroomsOwnedTotalPages, setChatroomsOwnedTotalPages] = useState(0);

    /**
     * Fonction qui permet d'effectuer la récupération des chatrooms owned par l'utilisateur connecté
     */
    useEffect(() => {
        const getChatroomsOwned = async (page) => {
            try{
                const response = await fetch(properties.getChatroomsByUserApi + loggedUser.id + "/chatrooms/owned?page=" + page,{
                    "credentials": "include",
                    "headers": {
                        "X-XSRF-TOKEN": csrfToken
                    }
                });
                const chatroomsOwned = await response.json();
                if(response.status === 401){
                    alert("Error code :" + response.status + " - Reason : " + response.statusText);
                    window.location.href = properties.LoginApi;
                }
                setChatroomsOwned(chatroomsOwned.content);
                setChatroomsOwnedTotalPages(chatroomsOwned.totalPages);
            }
            catch(error){
                console.log(error);
            }
        }
        getChatroomsOwned(chatroomsOwnedPage);
    },[csrfToken, loggedUser, chatroomsOwnedPage]);

    /**
     * Fonction qui permet de supprimer une chatroom
     */
    const DeleteChatroom = (chatroomId) => {
        fetch(properties.ChatroomApi + chatroomId, {
            "method": "DELETE",
            "credentials": "include",
            "headers": {
                "X-XSRF-TOKEN": csrfToken
            }
        })
            .then(response => {
                if(response.status === 401){
                    alert("Error code :" + response.status + " - Reason : " + response.statusText);
                    window.location.href = properties.LoginApi;
                }
                else if(response.status === 409){
                    alert("Erreur lors de la suppression de la Chatroom");
                }
                window.location.reload();
            })
            .catch(error => {console.log(error)});
    }

    /**
     * Fonction qui permet de gérer l'évènement de click sur le bouton delete
     */
    const handleClick = (chatroomId) => {
        return async (event) => {
            event.preventDefault();
            DeleteChatroom(chatroomId);
        }
    }

    return(
        <main style={{backgroundColor: 'white',border: '2px solid #ccc', padding: '10px',boxShadow: '0 4px 6px #39373D'}}>
            <h1>Liste des Chatrooms Owned :</h1>
            {chatroomsOwned.length > 0 ? (
                <>
                    <Table bordered hover variant="dark">
                        <thead>
                        <tr>
                            <th>Chatroom Id</th>
                            <th>Titre</th>
                            <th>Description du Chatroom</th>
                            <th>Operation</th>
                        </tr>
                        </thead>
                        <tbody>
                            {chatroomsOwned.map(
                                chatroom => (
                                    <tr key={chatroom.id}>
                                        <td>{chatroom.id}</td>
                                        <td>{chatroom.titre}</td>
                                        <td>{chatroom.description}</td>
                                        <td>
                                            <DropdownButton id="dropdown-basic-button" title="Navigate">
                                                <Dropdown.Item>
                                                    <Link to={`/ModifierChatroom/${chatroom.id}`}>Modifier</Link>
                                                </Dropdown.Item>
                                                <Dropdown.Item onClick={handleClick(chatroom.id)}>
                                                    Delete
                                                </Dropdown.Item>
                                                <Dropdown.Divider />
                                                <Dropdown.Item>
                                                    <Link to={`/Chatroom/${chatroom.id}`}>Entrer le chatroom</Link>
                                                </Dropdown.Item>
                                            </DropdownButton>
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </Table>
                    <Pagination
                        currentPage={chatroomsOwnedPage}
                        totalPages={chatroomsOwnedTotalPages}
                        handlePrevious={() => setChatroomsOwnedPage(chatroomsOwnedPage - 1)}
                        handleNext={() => setChatroomsOwnedPage(chatroomsOwnedPage + 1)}
                    />
                </>
                ):(<div>Vous n'avez pas de chatrooms !</div>)
            }
        </main>
    );
}