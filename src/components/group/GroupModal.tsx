import React, {useState} from "react";
import {Button, Container, Form, Modal, Dropdown, Row, Col} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle, faEdit} from "@fortawesome/free-solid-svg-icons";
import {Group, GroupEditableData, User} from "../../objectTypes";
import {Formik, FormikValues} from "formik";
import * as Yup from "yup";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {editGroup, newGroup} from "../../api/groups";
import {AxiosError} from "axios";
import {getUsers} from "../../api/users";

interface IProps {
  group?: Group,
}

const groupEditSchema = Yup.object().shape({
  groupName: Yup.string()
      .required('Group name required'),
  groupVeracity: Yup.string(),
  groupClosed: Yup.boolean(),
  groupEscalated: Yup.boolean(),
  groupLocation: Yup.string(),
  groupAssignedTo: Yup.string(),
  groupNotes: Yup.string(),
  groupPublic: Yup.boolean(),
});

const veracityOptions = ['Confirmed true', 'Confirmed false', 'Unconfirmed'];

export default function GroupModal(props: IProps) {
  const [modalShow, setModalShow] = useState(false);
  const queryClient = useQueryClient();
  const usersQuery = useQuery<User[] | undefined, AxiosError>("users", getUsers);
  const editGroupMutation = useMutation((groupData: GroupEditableData) => {return editGroup(groupData)}, {
    onSuccess: () => {
      setModalShow(false);
      queryClient.invalidateQueries("groups");
    }
  });
  const newGroupMutation = useMutation((groupData: GroupEditableData) => {return newGroup(groupData)}, {
    onSuccess: () => {
      setModalShow(false);
      queryClient.invalidateQueries("groups");
    }
  });
  const formValuesToGroup = (values: FormikValues) => {
    // This is because we can't use a null value as a select value.
    let assignedTo = values.groupAssignedTo;
    if (values.groupAssignedTo === "") {
      assignedTo = null;
    }
    if (props.group) {
      return {
        title: values.groupName,
        notes: values.groupNotes,
        veracity: values.groupVeracity,
        closed: values.groupClosed,
        assignedTo: assignedTo,
        locationName: values.groupLocation,
        public: values.groupPublic,
        escalated: values.groupEscalated,
        _id: props.group._id
      }
    } else {
      return {
        title: values.groupName,
        notes: values.groupNotes,
        veracity: values.groupVeracity,
        closed: values.groupClosed,
        assignedTo: assignedTo,
        locationName: values.groupLocation,
        public: values.groupPublic,
        escalated: values.groupEscalated
      }
    }
  }

  // Editing a group modal
  if (props.group) {
    return (
        <>
          <Dropdown.Item onClick={()=>setModalShow(true)}> <FontAwesomeIcon icon={faEdit}/> Edit</Dropdown.Item>
          <Modal
              show={modalShow}
              onHide={()=>setModalShow(false)}
              backdrop="static"
              keyboard={false}
          >
            <Formik
                initialValues={{
                  groupName: props.group.title,
                  groupVeracity: props.group.veracity,
                  groupClosed: props.group.closed,
                  groupEscalated: props.group.escalated,
                  groupLocation: props.group.locationName,
                  groupAssignedTo: props.group.assignedTo?._id || "",
                  groupNotes: props.group.notes,
                  groupPublic: props.group.public,
                }}
                validationSchema={groupEditSchema}
                onSubmit={(values, {setSubmitting, resetForm}) => {
                  editGroupMutation.mutate(formValuesToGroup(values));
                }}
            >
              {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleSubmit,
                  isSubmitting,
                }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                      <Modal.Header closeButton>
                        <Modal.Title>Edit group</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Container>
                          <Form.Group controlId="formUsername" className={"mb-3"}>
                            <Form.Label>Group name</Form.Label>
                            <Form.Control
                                name="groupName"
                                type="text"
                                value={values.groupName}
                                onChange={handleChange}
                            />
                          </Form.Group>
                          <Form.Group controlId="formUserEmail" className={"mb-3"}>
                            <Form.Label>Location</Form.Label>
                            <Form.Control
                                name="groupLocation"
                                type="text"
                                value={values.groupLocation}
                                onChange={handleChange}
                            />
                          </Form.Group>
                          <Row>
                            <Col md>
                              <Form.Group controlId="formUserRole" className={"mb-3"}>
                                <Form.Check
                                    type="switch"
                                    name="groupEscalated"
                                    label="Escalated?"
                                    onChange={handleChange}
                                />
                              </Form.Group>
                            </Col>
                            <Col md>
                              <Form.Group className={"mb-3"}>
                                <Form.Check
                                    type="switch"
                                    name="groupClosed"
                                    label="Closed?"
                                    onChange={handleChange}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          <Form.Group controlId="formUserRole" className={"mb-3"}>
                            <Form.Label>Veracity</Form.Label>
                            <Form.Select
                                name="groupVeracity"
                                value={values.groupVeracity}
                                onChange={handleChange}
                            >
                              {veracityOptions.map((option) => {
                                return <option key={option}>{option}</option>
                              })}
                            </Form.Select>
                          </Form.Group>
                          <Form.Group controlId="formUserRole" className={"mb-3"}>
                            <Form.Label>Assigned to</Form.Label>
                            <Form.Select
                                name="groupAssignedTo"
                                value={values.groupAssignedTo}
                                onChange={handleChange}
                            >
                              <option key="none" value={""}>None</option>
                              {usersQuery.isSuccess && usersQuery.data && usersQuery.data.map((user) => {
                                return <option key={user._id} value={user._id}>{user.username}</option>
                              })}
                            </Form.Select>
                          </Form.Group>
                          <Form.Group controlId="formUserEmail" className={"mb-3"}>
                            <Form.Label>Notes</Form.Label>
                            <Form.Control
                                as={"textarea"}
                                placeholder={"Write notes here."}
                                style={{ height : '100px'}}
                                name="groupNotes"
                                value={values.groupNotes}
                                onChange={handleChange}
                            />
                          </Form.Group>
                        </Container>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={()=>setModalShow(false)}>Cancel</Button>
                        <Button variant="primary" type="submit" disabled={isSubmitting}>Save</Button>
                      </Modal.Footer>
                    </Form>
                )}
            </Formik>
          </Modal>
        </>
    )
  } else {
    // New group modal
    return (
        <>
          <Button variant={"primary"} onClick={()=>setModalShow(true)}>
            <FontAwesomeIcon icon={faPlusCircle} className={"me-2"}></FontAwesomeIcon>
            <span> Create group </span>
          </Button>
          <Modal
              show={modalShow}
              onHide={()=>setModalShow(false)}
              backdrop="static"
              keyboard={false}
          >
            <Formik
                initialValues={{
                  groupName: "",
                  groupVeracity: "Unconfirmed",
                  groupClosed: false,
                  groupEscalated: false,
                  groupLocation: "",
                  groupAssignedTo: "",
                  groupNotes: "",
                  groupPublic: false,
                }}
                validationSchema={groupEditSchema}
                onSubmit={(values, {setSubmitting, resetForm}) => {
                  newGroupMutation.mutate(formValuesToGroup(values));
                }}
            >
              {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleSubmit,
                  isSubmitting,
                }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                      <Modal.Title>Create group</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Container>
                        <Form.Group controlId="formUsername" className={"mb-3"}>
                          <Form.Label>Group name</Form.Label>
                          <Form.Control
                              name="groupName"
                              type="text"
                              value={values.groupName}
                              onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group controlId="formUserEmail" className={"mb-3"}>
                          <Form.Label>Location</Form.Label>
                          <Form.Control
                              name="groupLocation"
                              type="text"
                              value={values.groupLocation}
                              onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group controlId="formUserRole" className={"mb-3"}>
                          <Form.Check
                              type="switch"
                              name="groupEscalated"
                              label="Escalated?"
                              onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group className={"mb-3"}>
                          <Form.Check
                              type="switch"
                              name="groupClosed"
                              label="Closed?"
                              onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group controlId="formUserRole" className={"mb-3"}>
                          <Form.Label>Veracity</Form.Label>
                          <Form.Select
                              name="groupVeracity"
                              value={values.groupVeracity}
                              onChange={handleChange}
                          >
                            {veracityOptions.map((option) => {
                              return <option key={option}>{option}</option>
                            })}
                          </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="formUserRole" className={"mb-3"}>
                          <Form.Label>Assigned to</Form.Label>
                          <Form.Select
                              name="groupAssignedTo"
                              value={values.groupAssignedTo}
                              onChange={handleChange}
                          >
                            <option key="none" value={""}>None</option>
                            {usersQuery.isSuccess && usersQuery.data && usersQuery.data.map((user) => {
                              return <option key={user._id} value={user._id}>{user.username}</option>
                            })}
                          </Form.Select>
                        </Form.Group>
                        <Form.Group controlId="formUserEmail" className={"mb-3"}>
                          <Form.Label>Notes</Form.Label>
                          <Form.Control
                              as={"textarea"}
                              placeholder={"Write notes here."}
                              style={{ height : '100px'}}
                              name="groupNotes"
                              value={values.groupNotes}
                              onChange={handleChange}
                          />
                        </Form.Group>
                      </Container>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={()=>setModalShow(false)}>Close</Button>
                      <Button variant="primary" type="submit">Submit</Button>
                    </Modal.Footer>
                  </Form>
                  )}
            </Formik>
          </Modal>
        </>
    )
  }
}