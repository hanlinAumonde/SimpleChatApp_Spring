import React, {useContext, useEffect, useState} from "react";
import properties from "../properties";
import {DropdownButton, Table, Dropdown} from "react-bootstrap";
import CsrfTokenContext from "../CsrfTokenContext";
import {Link} from "react-router-dom";

export default function ListeChatroomOwned(){
    const csrfToken = useContext(CsrfTokenContext);

    const [chatroomsOwned, setChatroomsOwned] = useState([]);

    useEffect(() => {
        const getChatroomsOwned = async () => {
            try{
                const response = await fetch(properties.getChatroomOwnedApi,{
                    "credentials": "include",
                    "headers": {
                        "X-XSRF-TOKEN": csrfToken
                    }
                });
                const chatroomsOwned = await response.json();
                if(response.status === 401){
                    window.location.href = properties.LoginApi;
                }
                setChatroomsOwned(chatroomsOwned);
            }
            catch(error){
                console.log(error);
            }
        }
        getChatroomsOwned();
    },[csrfToken]);

    const handleDelete = (chatroomId) => {
        fetch(properties.ChatroomApi + chatroomId, {
            "method": "DELETE",
            "credentials": "include",
            "headers": {
                "X-XSRF-TOKEN": csrfToken
            }
        })
            .then(response => {
                if(response.status === 401){
                    window.location.href = properties.LoginApi;
                }
                else if(response.status === 409){
                    alert("Erreur lors de la suppression de la Chatroom");
                }
                window.location.reload();
            })
            .catch(error => {console.log(error)});
    }

    const handleClick = (chatroomId) => {
        return async (event) => {
            event.preventDefault();
            handleDelete(chatroomId);
        }
    }

    return(
        <main>
            <h1>Liste des Chatrooms Owned :</h1>
            {chatroomsOwned.length > 0 ? (
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
                                            <Link to="/">Entrer le chatroom</Link>
                                        </Dropdown.Item>
                                    </DropdownButton>
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </Table>
                ):(<div>Vous n'avez pas de chatrooms !</div>)
            }
        </main>
    );
}