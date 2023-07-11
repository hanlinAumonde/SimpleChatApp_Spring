import React, {useEffect, useRef, useState} from 'react';
import LoginContext from "./LoginContext";
import CsrfTokenContext from "./CsrfTokenContext";
import properties from "./properties.json";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import { BrowserRouter as Router, Route , Routes } from "react-router-dom";
import Navigation from "./Components/Navigation";
import Cookies from "js-cookie";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Accueil from "./Pages/Accueil";
import PlanifierChatroom from "./Pages/PlanifierChatroom";
import ListeChatroomOwned from "./Pages/ListeChatroomOwned";
import ListeChatroomJoined from "./Pages/ListeChatroomJoined";
import ModifierChatroom from "./Pages/ModifierChatroom";
import Chatroom from "./Pages/Chatroom";
import Page404 from "./Pages/Page404";

function App() {
    const [user, setUser] = useState({});
    const csrfTk = useRef(null);

    /**
     * Cette fct est utilisée pour déconnecter l'utilisateur
     */
    const logout = async () => {
        await fetch(properties.LogoutApi, {
            method: 'POST',
            headers: {
                'X-XSRF-TOKEN': csrfTk.current
            },
            credentials: 'include'
        })
            .then(() => {
                console.log("user logged out");
                setUser({});
                window.location.href = properties.LoginApi;
            })
            .catch(error => console.log(error));
    }

    /**
    * Cette fct est utilisée pour récupérer l'utilisateur connecté et le token CSRF, puis le stocker dans les contextes correspondants
    */
    useEffect(() => {
        const getLoggedUser = () => {
            fetch(properties.LoggedUserApi,{
                credentials: 'include'
            })
                .then(response => {
                    if(response.status === 401){
                        //si l'utilisateur n'est pas connecté, on le redirige vers la page de login
                        console.log("return to login");
                        window.location.href = properties.LoginApi;
                    }else{
                        console.log("user logged");
                        csrfTk.current = Cookies.get('XSRF-TOKEN');
                        return response.json();
                    }
                })
                .then((userLogged) => {
                    setUser(userLogged);
                })
                .catch(error => console.log(error));
        }
        getLoggedUser();
        //on crée un timer pour récupérer l'utilisateur connecté toutes les 15 minutes
        const timer = setInterval(getLoggedUser, 1000*60*15);
        return () => clearInterval(timer);
    }, [])

    return (
        <>
            <Header/>
            {csrfTk.current && user?
            <LoginContext.Provider value={user}> <CsrfTokenContext.Provider value={csrfTk.current}>
                <Router> <Container fluid> <Row>
                    <Col xs={2}>
                        <Navigation logout={logout} />
                    </Col>
                    <Col xs={10}>
                        <Routes>
                            <Route path="/" element={<Accueil/>} />
                            <Route path="/userAccueil" element={<Accueil/>} />
                            <Route path="/planifierChatroom" element={<PlanifierChatroom/>} />
                            <Route path="/listeChatroom_Owned" element={<ListeChatroomOwned/>} />
                            <Route path="/listeChatroom_Joined" element={<ListeChatroomJoined/>} />
                            <Route path="/ModifierChatroom/:chatroomId" element={<ModifierChatroom/>} />
                            <Route path="/Chatroom/:chatroomId" element={<Chatroom/>} />
                            <Route path="*" element={<Page404/>} />
                        </Routes>
                    </Col>
                </Row> </Container> </Router>
            </CsrfTokenContext.Provider> </LoginContext.Provider>
            :
                <h1 className="d-flex justify-content-center align-items-center">Chargement ...</h1>
            }
            <Footer/>
        </>
    );
}

export default App;
