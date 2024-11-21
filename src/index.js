import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import store from './Components/reduxComponents/reducersStore'
import { Provider } from 'react-redux';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <Provider store={store}>
    <App />
    </Provider>
);

