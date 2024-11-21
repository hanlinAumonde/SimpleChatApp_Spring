import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import Cookies from 'js-cookie';
import properties from '../../properties.json';
import { setNewToken } from './csrfReducer';

export const getLoggedUserData = createAsyncThunk(
    'user/getLoggedUserData',
    async (_, { dispatch }) => {
        try{
            const response = await fetch(properties.LoggedUserApi,{
                credentials: 'include'
            });
            if(response.status === 401){
                //si l'utilisateur n'est pas connecté, on le redirige vers la page de login
                console.log("return to login");
                window.location.href = properties.LoginApi;
                throw new Error("unauthorized");
            }else{
                console.log("user logged");
                const token = Cookies.get('XSRF-TOKEN');
                dispatch(setNewToken(token));

                const userInfo = await response.json();
                return userInfo;
            }
        }catch(error){
            throw error;
        }
    }
);

export const logoutUser = createAsyncThunk(
    'user/logoutUser',
    async (_, { getState }) => {
        const csrfToken = getState().csrfToken.token;
        try{
            const response = await fetch(properties.LogoutApi,{
                method: 'POST',
                headers: {
                    'X-XSRF-TOKEN': csrfToken
                },
                credentials: 'include'
            });
            if(response.ok){
                console.log("user logged out");
                window.location.href = properties.LoginApi;
            }
        }catch(error){
            throw error;
        }
    }
);

export const userSlice = createSlice({
    name:'user',
    initialState:{
        userInfos:null,
        status:'idle',
        error:null
    },
    reducers:{
        clearUser: state => {
            state.userInfos = {};
            state.error = null;
        }
    },
    extraReducers(builder){
        builder
            .addCase(getLoggedUserData.pending, (state)=>{
                state.status = 'loading';
            })
            .addCase(getLoggedUserData.fulfilled, (state,action)=>{
                state.status = 'idle';
                state.userInfos = action.payload;
                state.error = null;
            })
            .addCase(getLoggedUserData.rejected,(state,action)=>{
                state.status = 'idle';
                state.error = action.error.message;
            })
            .addCase(logoutUser.fulfilled, state=>{
                state.userInfos = null;
                state.error = null;
            })

    }
})

export const { clearUser } = userSlice.actions;
export const selectUser = (state) => state.user.userInfos;

export default userSlice.reducer;