import React from "react";
import Table from 'react-bootstrap/Table';
import {ButtonToolbar, Card, Image} from "react-bootstrap";
import { Container } from 'react-bootstrap';
import UserModal from "./UserModal";
import {Tag, User} from "../../objectTypes";
import GroupTable from "../group/GroupTable";
import {useQuery} from "react-query";
import {getGroups} from "../../api/groups";
import {AxiosError} from "axios";
import {getTags} from "../../api/tags";
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
                    <UserModal user={props.user} variant={"button"}/>
                    <div className={"me-2"}></div>
                    <ConfirmModal type={"delete"} variant={"button"} user={props.user}/>
                  </>
              }
            </ButtonToolbar>
          </Card.Header>
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
          </Card.Body>
        </Card>
      </Container>
  );
}

export default UserProfileTable;