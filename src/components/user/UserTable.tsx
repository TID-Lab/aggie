import Table from 'react-bootstrap/Table';
import {Card, Container, ButtonToolbar, Dropdown, Button} from "react-bootstrap";
import UserModal from './UserModal';
import { Link } from 'react-router-dom';
import ConfirmModal from "../ConfirmModal";
import EllipsisToggle from "../EllipsisToggle";
import React from "react";
import {User} from "../../objectTypes";

interface IProps {
  users: User[] | [];
}

export default function UserTable(props: IProps) {
  let userRows;
  console.log(props.users);
  if (props.users.length > 0) {
    userRows = props.users.map((user: User) =>
        <tr key={user._id}>
          <td className={"align-middle"}><Link to={'/user/' + user._id}><b>{user.username}</b></Link></td>
          <td className={"align-middle"}><a href={"mailto:" + user.email}>{user.email}</a></td>
          <td className={"align-middle"}>
              {user.role !== "" &&
              <>{user.role}</>
              }
              {user.role === "" &&
              <>viewer</>
              }
          </td>
          <td>
            <Dropdown className={"float-end"}>
              <Dropdown.Toggle as={EllipsisToggle}/>
              <Dropdown.Menu variant={"dark"}>
                <UserModal user={user} variant="dropdown"></UserModal>
                <Dropdown.Divider/>
                <ConfirmModal type={"delete"} variant="dropdown" user={user}/>
              </Dropdown.Menu>
            </Dropdown>
          </td>
        </tr>
    );
  } else {
    userRows = <tr><td>No Users Found.</td></tr>
  }
  return (
      <Card className="mt-4">
        <Card.Header as={ButtonToolbar} className="justify-content-end">
          <UserModal variant="button"></UserModal>
        </Card.Header>
        <Card.Body>
          <Table hover>
            <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
            {userRows}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
  );
}
