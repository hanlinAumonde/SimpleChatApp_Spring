import React, {useEffect} from 'react';
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import { BrowserRouter as Router, Route , Routes } from "react-router-dom";
import Navigation from "./Components/Navigation";
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
import { useSelector, useDispatch } from 'react-redux'
import { selectCsrfToken } from './Components/reduxComponents/csrfReducer';
import { getLoggedUserData, selectUser } from './Components/reduxComponents/loggedUserReducer';

function App() {
    //const [user, setUser] = useState({});
    const user = useSelector(selectUser);
    //const csrfTk = useRef(null);
    const csrfToken = useSelector(selectCsrfToken);
    const dispatch = useDispatch();

    /**
    * Cette fct est utilisée pour récupérer l'utilisateur connecté et le token CSRF, puis le stocker dans les contextes correspondants
    */    
    useEffect(()=>{
        dispatch(getLoggedUserData());
        const timer = setInterval(() => {
            dispatch(getLoggedUserData());
        }, 1000 * 60 * 15);

        return () => clearInterval(timer);
    },[dispatch,csrfToken])

    return (
        <>
            <Header/>
            {user?
                <Router> <Container fluid> <Row>
                    <Col xs={2}>
                        <Navigation />
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
            :
                <h1 className="d-flex justify-content-center align-items-center">Chargement ...</h1>
            }
            <Footer/>
        </>
    );
}

export default App;
