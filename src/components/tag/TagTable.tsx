import * as React from 'react';
import { Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import {Card, ButtonToolbar, Dropdown} from "react-bootstrap";
import ConfirmModal from "../ConfirmModal";
import { Container } from 'react-bootstrap';
import TagModal from "./TagModal";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisV} from "@fortawesome/free-solid-svg-icons";
import EllipsisToggle from "../EllipsisToggle";
import UserModal from "../user/UserModal";
import {Tag} from "../../objectTypes";

interface IProps {
  tags: Tag[] | [];
}

export default function TagTable(props: IProps) {
  let tagRows;
  //
  if (props.tags.length > 0) {
    tagRows = props.tags.map((tag: Tag) =>
        <tr key={tag._id}>
          <td>{tag.name}</td>
          <td style={{backgroundColor: tag.color}}>{tag.color}</td>
          <td><Link to={"/user/" + tag.user._id}>{tag.user.username}</Link></td>
          <td>{ tag.description ? <>{tag.description}</> : <></> }</td>
          <td>{ tag.isCommentTag ? <Form.Check disabled type="switch" checked/>
              : <Form.Check
                  disabled
                  type="switch"
              /> }
          </td>
          <td>
            <Dropdown>
              <Dropdown.Toggle as={EllipsisToggle}/>
              <Dropdown.Menu variant={"dark"}>
                <TagModal tag={tag}></TagModal>
                <Dropdown.Divider/>
                <ConfirmModal type="delete" variant="dropdown" tag={tag}/>
              </Dropdown.Menu>
            </Dropdown>
          </td>

        </tr>
    );
  } else {
    tagRows = <tr><td>No Tags Found.</td><td/><td/><td/><td/><td/></tr>
  }

  return (
      <Container fluid className="pb-5">
        <h3>Tags</h3>
        <Card className="mt-3">
          <Card.Header as={ButtonToolbar} className="justify-content-end">
            <TagModal/>
          </Card.Header>
          <Card.Body>
            <Table hover>
              <thead>
              <tr>
                <th>Name</th>
                <th>Color</th>
                <th>Creator</th>
                <th>Description</th>
                <th>FB Comments</th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              {tagRows}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </Container>
  );
}
