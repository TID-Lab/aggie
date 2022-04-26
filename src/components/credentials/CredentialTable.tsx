import * as React from 'react';
import Table from 'react-bootstrap/Table';
import {Card, Pagination, Button, ButtonToolbar, Form, Image, Dropdown} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import EllipsisToggle from "../EllipsisToggle";
import ConfirmModal from "../ConfirmModal";
import CredentialModal from "./CredentialModal";
import {useEffect, useState} from "react";
import { Credential } from "../../objectTypes";
import "./CredentialsTable.css"

interface IProps {
  credentials: Credential[] | [];
}

export default function CredentialTable(props: IProps) {
  const [credentials, setCredentials] = useState<Credential[] | []>(props.credentials)
  let credentialRows;
  if (props.credentials.length > 0) {
    credentialRows = credentials.map((credential: Credential) =>
        <tr key={credential._id}>
          <td className={"td__credentialType align-middle"}><Image src={"/images/" + credential.type + ".png"} rounded/></td>
          <td className={"td__credentialName align-middle"}>{credential.name}</td>
          <td className={"align-middle"}>
            <div className={"float-end"}>
              <ConfirmModal type={"delete"} variant="icon" credential={credential}/>
            </div>
          </td>
        </tr>
    );
  } else {
    credentialRows = <tr><td>No credentials found.</td><td></td><td></td></tr>
  }

  return (
      <Card className="mt-3">
        <Card.Header as={ButtonToolbar} className="justify-content-end">
          <CredentialModal/>
        </Card.Header>
        <Card.Body>
          <Table hover>
            <thead>
            <tr>
              <th>Type</th>
              <th>Name</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            {credentialRows}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
  );
}
