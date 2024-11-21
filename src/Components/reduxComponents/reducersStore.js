import { configureStore } from "@reduxjs/toolkit";
import csrfTokenReducer from './csrfReducer';
import userReducer from './loggedUserReducer';

export default configureStore({
    reducer: {
        csrfToken : csrfTokenReducer,
        user : userReducer
    }
})