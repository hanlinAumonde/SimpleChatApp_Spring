import { createSlice } from '@reduxjs/toolkit';

export const csrfTokenSlice = createSlice({
    name:'csrfToken',
    initialState:{
        token:null
    },
    reducers:{
        setNewToken: (state,action) => {
            state.token = action.payload;
        },
        clearCurToken: state => {
            state.token = null;
        }
    }
})

export const { setNewToken, clearCurToken } = csrfTokenSlice.actions

export const selectCsrfToken = state => state.csrfToken.token

export default csrfTokenSlice.reducer