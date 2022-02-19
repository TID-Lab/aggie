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

interface IProps {
  credentials: Credential[] | [];
}

export default function CredentialTable(props: IProps) {
  const [credentials, setCredentials] = useState<Credential[] | []>([])
  useEffect(() => {
    setCredentials(props.credentials);
  });
  let credentialRows
  if (props.credentials.length > 0) {
    credentialRows = credentials.map((credential: Credential) =>
        <tr key={credential._id}>
          <td>{credential.name}</td>
          <td><Image src={"/images/" + credential.type + ".png"} rounded/></td>
          <td>
            <Dropdown>
              <Dropdown.Toggle as={EllipsisToggle}/>
              <Dropdown.Menu variant={"dark"}>
                <ConfirmModal type={"delete"} variant="dropdown" credential={credential}/>
              </Dropdown.Menu>
            </Dropdown>
          </td>
        </tr>
    );
  } else {
    credentialRows = <tr><td>No credentials found.</td><td></td><td></td></tr>
  }

  return (
      <Container fluid>
        <h3>Credentials</h3>
        <Card className="mt-3">
          <Card.Header as={ButtonToolbar} className="justify-content-end">
            <CredentialModal/>
          </Card.Header>
          <Card.Body>
            <Table hover>
              <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              {credentialRows}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
  );
}
