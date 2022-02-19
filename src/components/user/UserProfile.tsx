import React from "react";
import Table from 'react-bootstrap/Table';
import {Card, Image} from "react-bootstrap";
import { Container } from 'react-bootstrap';
import UserModal from "./UserModal";
import {User} from "../../objectTypes";

interface IProps {
  user: User | null
}

export default function UserProfile(props: IProps) {
  return (
      <Container fluid>
        <Card>
          <Card.Header as="h5">User profile</Card.Header>
          <Card.Body>
            <Table>
              <thead>
              <tr>
                <th><Image
                    alt="Username Logo"
                    src="/images/usernameicon.png"
                    width="30"
                    height="30"
                />{''} Username</th>
                <th>{props.user?.username}</th>
              </tr>
              <tr>
                <th><Image
                    alt="UserRole Logo"
                    src="/images/userRoleIcon.png"
                    width="25"
                    height="22"
                />{''} User Role</th>
                <th>{props.user?.role}</th>
              </tr>
              <tr>
                <th>
                  <Image
                    alt="User email Logo"
                    src="/images/userEmailIcon.png"
                    width="30"
                    height="30"
                  />
                  {''} User Email
                </th>
                <th>{props.user?.email}</th>
              </tr>
              </thead>
            </Table>
            {props.user &&
            <UserModal user={props.user} variant={"button"}/>
            }
          </Card.Body>
        </Card>
      </Container>
  );
}

