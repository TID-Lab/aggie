import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@yaireo/tagify/dist/tagify.css';
import AggieNavbar from "./components/AggieNavbar";
import AlertService, {AlertContent} from "./components/AlertService";
import {QueryClient, QueryClientProvider, useQuery, useQueryClient} from "react-query";
import {Reports, Session, Source} from "./objectTypes";
import {useCookies} from "react-cookie";
import AggieRoutes from "./AggieRoutes";


const App = () => {
  const [sessionToken, setSessionToken] = useState<Session | null>({
    email: "",
    hasDefaultPassword: false,
    provider: "",
    role: "undefined",
    username: "",
    __v: -1,
    _id: ""
  });
  // This is how we "globalize" the primary alert.
  const [globalAlert, setGlobalAlert] = useState<AlertContent>({
    heading: "",
    message: "",
    variant: "primary"
  });
  const queryClient = new QueryClient();
  return (
      <QueryClientProvider client={queryClient}>
        <AggieNavbar sessionToken={sessionToken}/>
        <AlertService globalAlert={globalAlert} setGlobalAlert={setGlobalAlert}/>
        <AggieRoutes setGlobalAlert={setGlobalAlert} setSessionToken={setSessionToken}/>
      </QueryClientProvider>
      )
}

export default App;
