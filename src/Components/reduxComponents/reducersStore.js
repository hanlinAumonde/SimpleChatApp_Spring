import { configureStore } from "@reduxjs/toolkit";
import csrfTokenReducer from './csrfReducer'

export default configureStore({
    reducer: {
        csrfToken : csrfTokenReducer
    }
})