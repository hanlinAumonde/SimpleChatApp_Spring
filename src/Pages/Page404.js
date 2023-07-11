import React from "react";
import {Button} from "react-bootstrap";

export default function Page404(){
    return(
        <div style={{display:"flex",justifyContent:"center"}}>
            <h1>Page not found</h1>
            <p>Cliquer sur le bouton pour retourner à l'accueil</p>
            <Button onClick={() => window.location.href = "/"}>Retour à l'accueil</Button>
        </div>
    )
}