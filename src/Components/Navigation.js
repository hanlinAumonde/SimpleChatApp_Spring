import React, { useContext } from 'react';
import LoginContext from "../LoginContext";
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { Link } from 'react-router-dom';

export default function Navigation({logout}) {
    const user = useContext(LoginContext);

    return (
        <nav>
            <Accordion defaultActiveKey="0" alwaysOpen>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>User - Info</Accordion.Header>
                    <Accordion.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item>Email Address : {user && user.mail}</ListGroup.Item>
                            <ListGroup.Item>FirstName : {user && user.firstName}</ListGroup.Item>
                            <ListGroup.Item>LastName : {user && user.lastName}</ListGroup.Item>
                        </ListGroup>
                        <Button variant="outline-danger" onClick={logout}>Logout</Button>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Menu</Accordion.Header>
                    <Accordion.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item><Link to="/userAccueil">Accueil</Link></ListGroup.Item>
                            <ListGroup.Item><Link to="/planifierChatroom">Planifier un Chatroom</Link></ListGroup.Item>
                            <ListGroup.Item><Link to="/listeChatroom_Owned">Votre Chatrooms</Link></ListGroup.Item>
                            <ListGroup.Item><Link to="/listeChatroom_Joined">Chatrooms Rejointes</Link></ListGroup.Item>
                        </ListGroup>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </nav>
    );
}