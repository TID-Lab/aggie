import React, { Component, useEffect, useState } from "react";
import socketIOClient from "socket.io-client";
import {Container} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock} from "@fortawesome/free-solid-svg-icons";

const ENDPOINT = "http://localhost:3000";

const StatsBar = () => {
  const [response, setResponse] = useState("");

  /*
  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    socket.on("stats", data => {
      setResponse(data);
    });
  }, []);
  * TODO: Make sure cors doesn't cause problems on actual use. Using static hardcoded data for now.
   */

  const stats = {
    totalReports: 10000,
    totalReportsPerMinute: 2,
    totalReportsUnread: 5000,
    totalReportsTagged: 359,
    totalReportsEscalated: 141,
    totalGroups: 30,
    totalGroupsEscalated: 9,
    timestamp: "14:23:20"
  }
  return (
      <div>
        <Container>
          <span>Total Reports</span>
          <h3>{stats.totalReports}</h3>
          <span>Reports/Last min</span>
          <h3>{stats.totalReportsPerMinute}</h3>
          <span>Unread Reports</span>
          <h3>{stats.totalReportsUnread}</h3>
          <span>Tagged Reports</span>
          <h3>{stats.totalReportsTagged}</h3>
          <span>Escalated Reports</span>
          <h3>{stats.totalReportsEscalated}</h3>
          <span>Groups</span>
          <h3>{stats.totalGroups}</h3>
          <span>Escalated Groups</span>
          <h3>{stats.totalGroupsEscalated}</h3>
          <div className="stats-timestamp">
            <small className="text-dark-gray">Last Updated</small>
            <br/>
            <i className="fa fa-clock-o text-dark-gray" aria-hidden="true"></i>
            <small><FontAwesomeIcon icon={faClock}/> {stats.timestamp}</small>
          </div>
        </Container>
      </div>
  );
}

export default StatsBar;
