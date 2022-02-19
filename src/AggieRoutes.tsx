import {Navigate, Route, Routes, useNavigate} from "react-router-dom";
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
import Analysis from "./pages/Analysis";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import React from "react";
import {Reports, Session, Source} from "./objectTypes";
import {AlertContent} from "./components/AlertService";
import {useQuery} from "react-query";
import {getSources} from "./api/sources";
import {getSession} from "./api/session";
import {getReports} from "./api/reports";

interface IProps {
  setGlobalAlert: (globalAlert: AlertContent) => void;
  setSessionToken: (sessionToken: Session | null) => void;
}
const AggieRoutes = (props: IProps) => {
  const navigate = useNavigate();
  const sessionQuery = useQuery<Session | null>("session", getSession);
  if (sessionQuery.isLoading) {
    // TODO: Make loading screen
    props.setSessionToken(null);
    return (
        <Login/>
    )
  }
  if (sessionQuery.isError) {
    navigate('/login');
    return (
        <Login/>
    )
  }
  if (sessionQuery.isSuccess && sessionQuery.data) {
    if (sessionQuery.data.role) {
      props.setSessionToken(sessionQuery.data);
      return (
          <Routes>
            <Route path="/" element={<Navigate replace to="/reports"/>}/>
            <Route path='/reports' element={
              <ReportsIndex setGlobalAlert={props.setGlobalAlert}/>
            }/>
            <Route path='/report/:id' element={<ReportDetails/>}/>
            <Route path='/batch' element={<BatchIndex/>}/>
            <Route path='/groups' element={<GroupsIndex/>}/>
            <Route path='/group/:id' element={<GroupDetails/>}/>
            <Route path='/sources' element={<SourcesIndex/>}/>
            <Route path='/source/:id' element={<SourceDetails/>}/>
            <Route path='/users' element={<UsersIndex/>}/>
            <Route path='/user/:id' element={<UserProfile/>}/>
            <Route path='/tags' element={<TagsIndex/>}/>
            <Route path='/config' element={<Configuration/>}/>
            <Route path='/credentials' element={<CredentialsIndex/>}/>
            <Route path='/analysis' element={<Analysis/>}/>
            <Route path='/404' element={<NotFound/>}/>
            <Route path="/" element={<Navigate replace to="/404"/>}/>
          </Routes>
      )
    } else {
      props.setSessionToken(null);
    }
  }
  //TODO: Make it so that the URL redirects to Login. See example: https://github.com/remix-run/react-router/blob/main/examples/auth/src/App.tsx
  return (
      <Login/>
  )
}

export default AggieRoutes