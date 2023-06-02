import React, {useContext, useEffect, useState} from "react";
import properties from "../properties.json";
import LoginContext from "../LoginContext";
import {Link} from "react-router-dom";
import {Table} from "react-bootstrap";
import CsrfTokenContext from "../CsrfTokenContext";
import Pagination from "../Components/Pagination";

export default function Accueil(){
    const loggedUser = useContext(LoginContext);
    const csrfToken = useContext(CsrfTokenContext);

    //les variables pour les chatrooms owned/joined et leurs pages
    const [chatroomsOwned, setChatroomsOwned] = useState([]);
    const [chatroomsOwnedPage, setChatroomsOwnedPage] = useState(0);
    const [chatroomsOwnedTotalPages, setChatroomsOwnedTotalPages] = useState(0);

    const [chatroomsJoined, setChatroomsJoined] = useState([]);
    const [chatroomsJoinedPage, setChatroomsjoinedPage] = useState(0);
    const [chatroomsjoinedTotalPages, setChatroomsjoinedTotalPages] = useState(0);

    /**
     * Fonction qui permet de récupérer les chatrooms owned par l'utilisateur connecté
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
    }, [csrfToken, loggedUser, chatroomsOwnedPage])

    /**
     * Fonction qui permet de récupérer les chatrooms joined par l'utilisateur connecté
     */
    useEffect(() => {
        const getChatroomsJoined = async (page) => {
            try{
                const response = await fetch(properties.getChatroomsByUserApi + loggedUser.id + "/chatrooms/joined?page=" + page,{
                    "credentials": "include",
                    "headers": {
                        "X-XSRF-TOKEN": csrfToken
                    }
                });
                const chatroomsJoined = await response.json();
                if(response.status === 401){
                    window.location.href = properties.LoginApi;
                }
                setChatroomsJoined(chatroomsJoined.content);
                setChatroomsjoinedTotalPages(chatroomsJoined.totalPages);
            }
            catch(error){
                console.log(error);
            }
        }
        getChatroomsJoined(chatroomsJoinedPage);
    }, [csrfToken, loggedUser, chatroomsJoinedPage])

    return(
        <main style={{backgroundColor: 'white',border: '2px solid #ccc', padding: '10px',boxShadow: '0 4px 6px #39373D'}}>
            <h1>Welcome {loggedUser.firstName} !</h1>
            <section style={{border:"2px solid #ccc",padding:"10px",boxShadow:"0 4px 6px rgba(0, 0, 0, 0.1)"}}>
                <h2>Voici votre Chatrooms :</h2>
                <div>
                    Vous pouvez voir vos Chatrooms dans <Link to="/listeChatroom_Owned">Chatrooms Owned</Link> et faire les operations.
                </div>
                <div>S'il ya des chatrooms que vous avez planifié n'ont pas etre affiché, c'est possible que ils ont deja expiré.</div>
                {chatroomsOwned.length > 0 ? (
                    <>
                        <Table bordered hover variant="dark">
                        <thead>
                        <tr>
                            <th>Chatroom Id</th>
                            <th>Titre</th>
                            <th>Description du Chatroom</th>
                        </tr>
                        </thead>
                        <tbody>
                        {chatroomsOwned.map(
                            chatroom => (
                                <tr key={chatroom.id}>
                                    <td>{chatroom.id}</td>
                                    <td>{chatroom.titre}</td>
                                    <td>{chatroom.description}</td>
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
                    )
                    :(<div>Vous n'avez pas de chatrooms !</div>)
                }
            </section>
            <div style={{height:"10px"}}></div>
            <section style={{border:"2px solid #ccc",padding:"10px",boxShadow:"0 4px 6px rgba(0, 0, 0, 0.1)"}}>
                <h2>Voici les Chatrooms que vous avez rejoint :</h2>
                <div>
                    Vous pouvez voir les Chatrooms que vous avez rejoint dans <Link to="/listeChatroom_Joined">Chatrooms Joined</Link> et faire les operations.
                </div>
                <div>S'il ya des chatrooms que vous avez rejoint n'ont pas etre affiché, c'est possible que ils ont deja expiré.</div>
                {chatroomsJoined.length > 0 ? (
                <>
                    <Table bordered hover variant="dark">
                    <thead>
                    <tr>
                        <th>Chatroom Id</th>
                        <th>Titre</th>
                        <th>Description du Chatroom</th>
                    </tr>
                    </thead>
                    <tbody>
                    {chatroomsJoined.map(
                        chatroom => (
                            <tr key={chatroom.id}>
                                <td>{chatroom.id}</td>
                                <td>{chatroom.titre}</td>
                                <td>{chatroom.description}</td>
                            </tr>
                        )
                    )}
                    </tbody>
                    </Table>
                    <Pagination
                        currentPage={chatroomsJoinedPage}
                        totalPages={chatroomsjoinedTotalPages}
                        handlePrevious={() => setChatroomsjoinedPage(chatroomsJoinedPage - 1)}
                        handleNext={() => setChatroomsjoinedPage(chatroomsJoinedPage + 1)}
                    />
                </>
                    )
                    :
                    (<div>Vous n'avez rejoint aucun chatrooms !</div>)
                }
            </section>
        </main>
    );

}