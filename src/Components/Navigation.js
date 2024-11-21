import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import Button from 'react-bootstrap/Button';
import ListGroup from 'react-bootstrap/ListGroup';
import { Link } from 'react-router-dom';
import styles from '../Styles/Navigation.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser, logoutUser } from './reduxComponents/loggedUserReducer';

/**
 * Composant de navigation dans la page
 * Le 1er partie est pour afficher les informations de l'utilisateur connecté
 * Le 2ème partie est pour afficher les liens vers les différentes pages
 */
export default function Navigation() {
    //const loggedUser = useContext(LoginContext);
    const loggedUser = useSelector(selectUser);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    return (
        <nav>
            <Accordion defaultActiveKey="0" alwaysOpen>
                <Accordion.Item eventKey="0">
                    <Accordion.Header>User - Info</Accordion.Header>
                    <Accordion.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item style={{wordWrap:"break-word"}}>Email Address : {loggedUser?.mail}</ListGroup.Item>
                            <ListGroup.Item>FirstName : {loggedUser?.firstName}</ListGroup.Item>
                            <ListGroup.Item>LastName : {loggedUser?.lastName}</ListGroup.Item>
                        </ListGroup>
                        <Button variant="outline-danger" onClick={handleLogout}>Déconnexion</Button>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header>Menu</Accordion.Header>
                    <Accordion.Body>
                        <ListGroup variant="flush">
                            <ListGroup.Item><Link to="/userAccueil" className={styles.link}>Accueil</Link></ListGroup.Item>
                            <ListGroup.Item><Link to="/planifierChatroom" className={styles.link}>Planifier un Chatroom</Link></ListGroup.Item>
                            <ListGroup.Item><Link to="/listeChatroom_Owned" className={styles.link}>Votre Chatrooms</Link></ListGroup.Item>
                            <ListGroup.Item><Link to="/listeChatroom_Joined" className={styles.link}>Chatrooms Rejointes</Link></ListGroup.Item>
                        </ListGroup>
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </nav>
    );
}