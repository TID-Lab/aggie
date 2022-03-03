import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';
import {QueryClient, QueryClientProvider, useQuery, useQueryClient} from "react-query";
import reportWebVitals from './reportWebVitals';
import axios from "axios";

axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;

const queryClient = new QueryClient()
ReactDOM.render((
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
), document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
serviceWorkerRegistration.unregister();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
