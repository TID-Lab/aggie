import React from "react";
import Table from 'react-bootstrap/Table';
import {ButtonToolbar, Card, Image} from "react-bootstrap";
import { Container } from 'react-bootstrap';
import UserModal from "./UserModal";
import {Tag, User} from "../../objectTypes";
import ConfirmModal from "../ConfirmModal";

interface IProps {
  user: User | null,
  isCurrentUser: boolean | null
}

const UserProfileTable = (props: IProps) => {
  return (
      <Container fluid>
        <h3 className={"mb-4"}>{props.isCurrentUser ? "Your profile" : "User profile" }</h3>
        <Card>
          <Card.Header className="pe-2 ps-2">
            <ButtonToolbar className="justify-content-end">
              {props.user &&
                  <>
                    <UserModal user={props.user} variant={"button"} size="sm"/>
                    <div className={"me-2"}></div>
                    <ConfirmModal type={"delete"} variant={"button"} user={props.user} size="sm"/>
                  </>
              }
            </ButtonToolbar>
          </Card.Header>
          <Card.Body>
            <Table>
              <thead>
              <tr>
                <th> Username</th>
                <th>{props.user?.username}</th>
              </tr>
              <tr>
                <th>Role</th>
                <th>{props.user?.role}</th>
              </tr>
              <tr>
                <th>
                  Email
                </th>
                <th>{props.user?.email}</th>
              </tr>
              </thead>
            </Table>
          </Card.Body>
        </Card>
      </Container>
  );
}

export default UserProfileTable;