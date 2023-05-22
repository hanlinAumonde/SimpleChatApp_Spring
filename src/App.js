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
import Accueil from "./Components/Accueil";
import PlanifierChatroom from "./Components/PlanifierChatroom";
import ListeChatroomOwned from "./Components/ListeChatroomOwned";
import ListeChatroomJoined from "./Components/ListeChatroomJoined";
import ModifierChatroom from "./Components/ModifierChatroom";

function App() {
    const [user, setUser] = useState({});
    const csrfTk = useRef(null);

    const getLoggedUser = () => {
        fetch(properties.LoggedUserApi,{
            credentials: 'include'
        })
            .then(response => {
                if(response.status === 401){
                    console.log("return to login");
                    window.location.href = properties.LoginApi;
                }else{
                    console.log("user logged");
                    csrfTk.current = Cookies.get('XSRF-TOKEN');
                    console.log(csrfTk.current);
                    return response.json();
                }
            })
            .then((userLogged) => {
                setUser(userLogged);
            })
            .catch(error => console.log(error));
    }

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

    useEffect(() => {
        getLoggedUser();
        const timer = setInterval(getLoggedUser, 1000*60*15);
        return () => clearInterval(timer);
    }, [])

    return (
        <>
            <Header/>
            <LoginContext.Provider value={user}> <CsrfTokenContext.Provider value={csrfTk.current}>
                <Router> <Container fluid> <Row>
                    <Col xs={3}>
                        <Navigation logout={logout} />
                    </Col>
                    <Col xs={9}>
                        <Routes>
                            <Route path="/" element={<Accueil/>} />
                            <Route path="/userAccueil" element={<Accueil/>} />
                            <Route path="/planifierChatroom" element={<PlanifierChatroom/>} />
                            <Route path="/listeChatroom_Owned" element={<ListeChatroomOwned/>} />
                            <Route path="/listeChatroom_Joined" element={<ListeChatroomJoined/>} />
                            <Route path="/ModifierChatroom/:chatroomId" element={<ModifierChatroom/>} />
                        </Routes>
                    </Col>
                </Row> </Container> </Router>
            </CsrfTokenContext.Provider> </LoginContext.Provider>
            <Footer/>
        </>
    );
}

export default App;
