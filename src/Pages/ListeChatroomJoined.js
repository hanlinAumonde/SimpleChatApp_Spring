import React, {useContext, useEffect, useState} from "react";
import properties from "../properties.json";
import {Button, Col, Container, Dropdown, DropdownButton, Row, Table} from "react-bootstrap";
import CsrfTokenContext from "../CsrfTokenContext";
import LoginContext from "../LoginContext";
import {Link} from "react-router-dom";
import Pagination from "../Components/Pagination";

export default function ListeChatroomJoined(){
    const csrfToken = useContext(CsrfTokenContext);
    const loggedUser = useContext(LoginContext);

    const [chatroomsJoined, setChatroomsJoined] = useState([]);
    const [chatroomsJoinedPage, setChatroomsJoinedPage] = useState(0);
    const [chatroomsJoinedTotalPages, setChatroomsJoinedTotalPages] = useState(0);

    useEffect(() => {
        const getChatroomsJoined = async (page) => {
            try{
                const response = await fetch(properties.getChatroomsByUserApi + loggedUser.id + "/chatrooms/joined?page=" + page,{
                    "credentials": "include",
                    "headers": {
                        "X-XSRF-TOKEN": csrfToken
                    }
                });
                let chatroomsJoined = await response.json();
                if(response.status === 401){
                    alert("Error code :" + response.status + " - Reason : " + response.statusText);
                    window.location.href = properties.LoginApi;
                }

                const promises = chatroomsJoined.content.map(async (chatroom) => {
                    const ownerResponse = await fetch(properties.ChatroomApi + chatroom.id + "/users/owner", {
                        "credentials": "include",
                        "headers": {
                            "X-XSRF-TOKEN": csrfToken
                        }
                    });
                    const statusResponse = await fetch(properties.ChatroomApi + chatroom.id + "/status", {
                        "credentials": "include",
                        "headers": {
                            "X-XSRF-TOKEN": csrfToken
                        }
                    });
                    if (ownerResponse.status === 401 || statusResponse.status === 401) {
                        alert("Error code :" + ownerResponse.status + " - Reason : Not authorized");
                        window.location.href = properties.LoginApi;
                    }
                    const owner = await ownerResponse.json();
                    const status = await statusResponse.json();
                    return { ...chatroom, owner , chatroomStatus : status};
                });

                chatroomsJoined = await Promise.all(promises);

                setChatroomsJoined(chatroomsJoined);
                setChatroomsJoinedTotalPages(chatroomsJoined.totalPages);
            }
            catch(error){
                console.log(error);
            }
        }
        getChatroomsJoined(chatroomsJoinedPage);
    },[csrfToken, loggedUser, chatroomsJoinedPage]);


    const handleQuitter = (chatroomId,userId) => {
        fetch(properties.ChatroomApi + chatroomId + "/users/invited/" + userId, {
            "method": "DELETE",
            "credentials": "include",
            "headers": {
                "X-XSRF-TOKEN": csrfToken
            }
        })
            .then(response => {
                if (response.status === 401) {
                    alert("Error code :" + response.status + " - Reason : " + response.statusText);
                    window.location.href = properties.LoginApi;
                } else if (response.status === 409) {
                    alert("Erreur lors de quitter la Chatroom");
                }
                window.location.reload();
            })
            .catch(error => {
                console.log(error)
            });
    }

    const handleClick_Quitter = (chatroomId,userId) => {
        return async (event) => {
            event.preventDefault();
            handleQuitter(chatroomId,userId);
        }
    }

    return(
        <main style={{backgroundColor: 'white',border: '2px solid #ccc', padding: '10px',boxShadow: '0 4px 6px #39373D'}}>
            <h1>Liste des Chatrooms Rejointes</h1>
            {chatroomsJoined.length > 0 ? (
            <>
                <Table bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>Chatroom Id</th>
                        <th>Titre</th>
                        <th>Description du Chatroom</th>
                        <th>Owner du Chatroom</th>
                        <th>Operations</th>
                    </tr>
                    </thead>
                    <tbody>
                    {chatroomsJoined.map((chatroom) => (
                        <tr key={chatroom.id}>
                            <td>{chatroom.id}</td>
                            <td>{chatroom.titre}</td>
                            <td>{chatroom.description}</td>
                            <td>{chatroom.owner? chatroom.owner.firstName + " " + chatroom.owner.lastName : "Loading .."}</td>
                            <td>
                                <DropdownButton id="dropdown-basic-button" title="Navigate">
                                    <Dropdown.Item onClick={handleClick_Quitter(chatroom.id,loggedUser.id)}>
                                        Quitter le chatroom
                                    </Dropdown.Item>
                                    <Dropdown.Divider />
                                    <Dropdown.Item disabled={chatroom.chatroomStatus? !chatroom.chatroomStatus : true}>
                                        <Link to={`/Chatroom/${chatroom.id}`}>Entrer le chatroom</Link>
                                    </Dropdown.Item>
                                </DropdownButton>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
                <Pagination
                    currentPage={chatroomsJoinedPage}
                    totalPages={chatroomsJoinedTotalPages}
                    handlePrevious={() => setChatroomsJoinedPage(chatroomsJoinedPage - 1)}
                    handleNext={() => setChatroomsJoinedPage(chatroomsJoinedPage + 1)}
                />
            </>
                ):(<div>Vous n'avez rejoint aucun chatrooms !</div>)
            }
        </main>
    );
}