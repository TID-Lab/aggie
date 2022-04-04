import {Button, Container, Form, Modal, Table} from "react-bootstrap";
import React, {useState} from "react";
// @ts-ignore
import Tags from "@yaireo/tagify/dist/react.tagify";
import {Link} from "react-router-dom";
import {groupById, tagsById} from "../../helpers";
import {ReportRow} from "../report/ReportTable";
import './EditGroupModal.css';
import axios from "axios";
import {Group, Groups, Report, Reports, Source, Tag, User} from "../../objectTypes";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import {GroupRow} from "./GroupTable";
import {useQuery} from "react-query";
import {getGroups} from "../../api/groups";
import {getUsers} from "../../api/users";

interface IProps {
  reports: Set<Report>,
  tags: Tag[] | null,
  groups: Group[] | [],
  sources: Source[] | [],
  groupId: string | undefined,
  variant: "inline" | "selection"
}

export default function EditGroupModal(props: IProps) {
  const groupQuery = useQuery<Groups | undefined>(["groups", "all"], ()=>{return getGroups()})
  const userQuery = useQuery<User[] | undefined>("users", getUsers);
  const [show, setShow] = useState(false);
  const [reports, setReports] = useState<Report[]>(Array.from(props.reports));
  const handleClose = () => {
    setShow(false);
  }

  const handleShow = () => {
    setShow(true);
  }
  // @ts-ignore
  const handleSubmit = (event) => {
    const form = event.currentTarget;
  };

  const setGroup = (group: Group) => {

  }

  const ReportRows = () => {

  }

  const ReportGroupModalJSX = () => {
    if (reports.length > 0 && show) {
      return (
          <>
            <Modal.Header closeButton>
              {reports.length > 1
                  ? <Modal.Title>Edit multiple reports' groups</Modal.Title>
                  : <Modal.Title>Edit report group</Modal.Title>
              }
            </Modal.Header>
            <Modal.Body>
              <Container fluid>
                <Table bordered responsive>
                  <thead>
                    <tr>
                      <th>Source info</th>
                      <th>Thumbnail</th>
                      <th>Content</th>
                      <th>Tags</th>
                      <th>Group</th>
                    </tr>
                  </thead>
                  <tbody>
                  { reports.map((report) => {
                    return(
                        <ReportRow
                            variant="modal"
                            key={report._id}
                            report={report}
                            tags={props.tags}
                            groups={props.groups}
                            sources={props.sources}
                        />
                    )
                  })}
                  </tbody>
                </Table>
                <h5>Groups</h5>
                <Table hover responsive size={"sm"}>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Location</th>
                      <th>Notes</th>
                      <th>Assigned to</th>
                      <th>Creation info</th>
                      <th>Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                  { userQuery.data && props.groups && props.groups.map((group)=>{
                    if (props.tags && userQuery.data) {
                      return (
                          <GroupRow
                              key={group._id}
                              variant='modal'
                              tags={props.tags}
                              group={group}
                              users={userQuery.data}
                              sources={props.sources}
                          />);
                    }
                  })}
                  </tbody>
                </Table>
              </Container>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button variant="primary" type="submit">Save</Button>
            </Modal.Footer>
          </>
      )
    }
  }
  return (
      <>
        { props.variant === "inline" &&
            <Button variant="link" onClick={handleShow}>
              {props.groupId ? groupById(props.groupId, props.groups) : "Edit"}
            </Button>
        }
        { props.variant === "selection" &&
            <Button variant={"secondary"} onClick={handleShow} disabled={reports.length === 0}>
              <FontAwesomeIcon icon={faPlusCircle} className={"me-2"} onClick={()=>{
              }}/>
              Add to group
            </Button>
        }
        <Modal
            show={show}
            size={"xl"}
            onHide={handleClose}
            fullscreen={"xl-down"}
            backdrop="static"
            keyboard={false}
        >
          <Form onSubmit={handleSubmit}>
            {ReportGroupModalJSX()}
          </Form>
        </Modal>
      </>
  )
}