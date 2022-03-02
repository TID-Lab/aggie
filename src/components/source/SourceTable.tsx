import * as React from 'react';
import {Card, Container, ButtonToolbar, Form, Image, Dropdown, Table} from "react-bootstrap";
import { Link } from 'react-router-dom';
import EllipsisToggle from "../EllipsisToggle";
import ConfirmModal from "../ConfirmModal";
import SourceModal from "./SourceModal";
import axios from "axios";
import {Source, Credential} from "../../objectTypes";
import {useMutation} from "react-query";
import {editSource, newSource} from "../../api/sources";

interface IProps {
  sources: Source[] | [];
  credentials: Credential[] | [];
}

export default function SourceTable(props: IProps) {
  const editSourceMutation = useMutation((sourceData: any) => {
    return editSource(sourceData);
  });
  let sourceRows;
  const handleChange = async (source: Source) => {
    source.enabled = !source.enabled;
    editSourceMutation.mutate(source, {onSuccess: ()=>console.log("Source toggled.")})
  }

  if (props.sources.length > 0) {
    sourceRows = props.sources.map((source: Source) =>
        <tr key={source._id}>
          <td><Image src={"/images/" + source.media + ".png"} rounded/></td>
          <td><Link to={"/source/" + source._id}>{source.nickname}</Link></td>
          {source.user
              ? <td>{source.credentials.name}</td>
              : <td></td>
          }
          {source.keywords
              ? <td>{source.keywords}</td>
              : <td></td>
          }
          <td>{source.tags}</td>
          <td>{source.unreadErrorCount}</td>
          <td>
            <Form>
              <Form.Switch
                  id={source._id}
                  defaultChecked={source.enabled}
                  onChange={(e) => handleChange(source)}
              />
            </Form>
          </td>
          <td>
            <Dropdown>
              <Dropdown.Toggle as={EllipsisToggle}/>
              <Dropdown.Menu variant={"dark"}>
                <SourceModal source={source} variant={"dropdown"} credentials={props.credentials}></SourceModal>
                <Dropdown.Divider/>
                <ConfirmModal type={"delete"} variant={"dropdown"} source={source}/>
              </Dropdown.Menu>
            </Dropdown>
          </td>
        </tr>
    );
  } else {
    sourceRows = <tr><td>No Sources Found.</td><td/><td/><td/><td/><td/><td/><td/></tr>
  }

  return (
    <Container fluid>
      <h3>Sources</h3>
      <Card className="mt-3">
        <Card.Header as={ButtonToolbar} className="justify-content-end">
            <SourceModal variant={"dropdown"} credentials={props.credentials}></SourceModal>
        </Card.Header>
        <Card.Body>
          <Table hover responsive>
            <thead>
            <tr>
              <th>Media</th>
              <th>Name</th>
              <th>Credential</th>
              <th>Keywords</th>
              <th>Notes</th>
              <th>New Warnings</th>
              <th>Enabled</th>
              <th></th>
            </tr>
            </thead>
            <tbody>
              {sourceRows}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
}
