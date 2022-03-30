import React, { useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@yaireo/tagify/dist/tagify.css';
import AggieNavbar from "./components/AggieNavbar";
import AlertService, {AlertContent} from "./components/AlertService";
import {Navigate, Route, Routes} from "react-router-dom";
import ReportsIndex from "./pages/report/ReportsIndex";
import ReportDetails from "./pages/report/ReportDetails";
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
import ResetPassword from "./pages/ResetPassword";

const App = () => {
  // This is how we "globalize" the primary alert.

  const [globalAlert, setGlobalAlert] = useState<AlertContent>({
    heading: "",
    message: "",
    variant: "primary"
  });
  return (
      <>
        <AggieNavbar/>
        <AlertService globalAlert={globalAlert} setGlobalAlert={setGlobalAlert}/>
        <Routes>
          <Route path="/">
            <Route path='login' element={<Login/>}></Route>
            <Route index element={<Navigate to={'reports'}/>}/>
            <Route path='reports' element={<ReportsIndex setGlobalAlert={setGlobalAlert}/>}/>
            <Route path='report/:id' element={<ReportDetails/>}/>
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
            <Route path='reset-password' element={<ResetPassword/>}/>
            <Route path='404' element={<NotFound/>}/>
            <Route path="*" element={<Navigate replace to="/404"/>}/>
          </Route>
        </Routes>
      </>
  )

}


export default App;
