import {Button, Container, Form, Modal, Table} from "react-bootstrap";
import React, {useState} from "react";
// @ts-ignore
import Tags from "@yaireo/tagify/dist/react.tagify";
import {Link} from "react-router-dom";
import {groupById, tagsById} from "../../helpers";
import {ReportRow} from "../report/ReportTable";
import './EditGroupModal.css';
import axios from "axios";
import {Group, Report, Source, Tag} from "../../objectTypes";

interface IProps {
  reports?: Report[],
  tags: Tag[] | null,
  groups: Group[] | [],
  sources: Source[] | [],
  groupId: string | undefined
}

export default function EditGroupModal(props: IProps) {
  const [show, setShow] = useState(false);
  const [reports, setReports] = useState(props.reports);
  const [groups, setGroups] = useState(props.groups);

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
    if (reports) {
      if (reports.length === 1) {
        axios({
          method: "PUT",
          url: "/api/report/" + reports[0]._id,
          data: {
            _group: group._id,
          }
        }).then(response => {
          if (props.reports) {
            props.reports[0]._incident = group._id;
            setReports ([props.reports[0]]);
          }
        }).catch(error => {
          console.error(error);
        });
      } else {

      }
    }
  }

  const ReportGroupModalJSX = () => {
    if (props.reports) {
      let tagifyRef;
      let tagifySettings = {
        whitelist: props.tags,
        autoComplete: {
          enabled: true
        }
      }
      return (
          <>
            <Modal.Header closeButton>
              {props.reports.length === 1
                  ? <Modal.Title>Edit report group</Modal.Title>
                  : <Modal.Title>Edit multiple reports' groups</Modal.Title>
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
                  { reports && reports.map((report) => {
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
                  { groups && groups.map((group)=>{
                    return (
                        <tr key={group._id} className={"group__select"} onClick={()=>{setGroup(group)}}>
                          <td><b>{group.idnum}</b></td>
                          <td>{group.title}</td>
                          <td>{group.locationName}</td>
                          <td>{group.notes}</td>
                          <td>{group.assignedTo && <>{group.assignedTo.username}</>}</td>
                          <td>{group.creator.username}</td>
                          <td>{group.smtcTags}</td>
                        </tr>
                        )
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
        { props.groupId
            ? <Button variant="link" onClick={handleShow}>{groupById(props.groupId, groups)}</Button>
            : <Button variant="link" onClick={handleShow}>Edit</Button>
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