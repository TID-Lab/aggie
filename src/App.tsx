import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@yaireo/tagify/dist/tagify.css';
import AggieNavbar from "./components/AggieNavbar";
import AlertService, {AlertContent} from "./components/AlertService";
import {Session} from "./objectTypes";
import {useQuery} from "react-query";
import {getSession} from "./api/session";
import {Navigate, Route, Routes} from "react-router-dom";
import ReportsIndex from "./pages/report/ReportsIndex";
import ReportDetails from "./pages/report/ReportDetails";
import BatchIndex from "./pages/report/BatchIndex";
import GroupsIndex from "./pages/group/GroupsIndex";
import GroupDetails from "./pages/group/GroupDetails";
import SourcesIndex from "./pages/source/SourcesIndex";
import SourceDetails from "./pages/source/SourceDetails";
import UsersIndex from "./pages/user/UsersIndex";
import UserProfile from "./pages/user/UserProfile";
import TagsIndex from "./pages/tag/TagsIndex";
import Configuration from "./pages/Configuration";
import CredentialsIndex from "./pages/CredentialsIndex";
import Login from "./pages/Login";
import Analysis from "./pages/Analysis";
import NotFound from "./pages/NotFound";
import {Spinner} from "react-bootstrap";


const App = () => {
  const sessionQuery = useQuery<Session | null>("session", getSession, {
  });

  // This is how we "globalize" the primary alert.
  const [globalAlert, setGlobalAlert] = useState<AlertContent>({
    heading: "",
    message: "",
    variant: "primary"
  });

  if (sessionQuery.isSuccess && sessionQuery.data && sessionQuery.data.role) {
    return (
        <>
          <AggieNavbar sessionToken={sessionQuery.data}/>
          <AlertService globalAlert={globalAlert} setGlobalAlert={setGlobalAlert}/>
          <Routes>
            <Route path="/">
              <Route index element={<Navigate to={'reports'}/>}/>
              <Route path='reports' element={<ReportsIndex setGlobalAlert={setGlobalAlert}/>}/>
              <Route path='report/:id' element={<ReportDetails/>}/>
              <Route path='batch' element={<BatchIndex/>}/>
              <Route path='groups' element={<GroupsIndex/>}/>
              <Route path='group/:id' element={<GroupDetails/>}/>
              <Route path='sources' element={<SourcesIndex/>}/>
              <Route path='source/:id' element={<SourceDetails/>}/>
              <Route path='users' element={<UsersIndex/>}/>
              <Route path='user/:id' element={<UserProfile/>}/>
              <Route path='tags' element={<TagsIndex/>}/>
              <Route path='config' element={<Configuration/>}/>
              <Route path='credentials' element={<CredentialsIndex/>}/>
              <Route path='analysis' element={<Analysis/>}/>
              <Route path='404' element={<NotFound/>}/>
              <Route path="*" element={<Navigate replace to="/404"/>}/>
            </Route>
          </Routes>
        </>
    )
  } else {
    // Not logged in state
    if (sessionQuery.isSuccess) {
      return <Login/>
    } else {
      if (sessionQuery.isLoading)
          // Loading state
        return (
            <div>
              <Spinner animation="border" role="status" variant={"success"}>
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
        )
      else {
        return (
            <div>
              ERROR
            </div>
        )
      }
    }
  }

}


export default App;
