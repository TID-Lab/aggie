import React, {useState} from "react";
import {Button, Container, Modal, Dropdown, Row, Col, FormLabel, FormGroup, FormCheck} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle, faEdit} from "@fortawesome/free-solid-svg-icons";
import {Group, GroupEditableData, User} from "../../objectTypes";
import {Formik, FormikValues, Form, Field} from "formik";
import * as Yup from "yup";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {editGroup, newGroup} from "../../api/groups";
import {AxiosError} from "axios";
import {getUsers} from "../../api/users";
import {VERACITY_OPTIONS} from "../../helpers";

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

  return (
      <>
        {props.group &&
            <Dropdown.Item onClick={()=>setModalShow(true)}> <FontAwesomeIcon icon={faEdit}/> Edit</Dropdown.Item>
        }
        {!props.group &&
            <Button variant="primary" onClick={()=>setModalShow(true)} size="sm">
              <FontAwesomeIcon icon={faPlusCircle} className={"me-1"}></FontAwesomeIcon>
              <span> Create group </span>
            </Button>
        }
        <Modal
            show={modalShow}
            onHide={()=>setModalShow(false)}
            backdrop="static"
            keyboard={false}
        >
          <Formik
              initialValues={{
                groupName: props.group ? props.group.title : "",
                groupVeracity: props.group ? props.group.veracity : VERACITY_OPTIONS[0],
                groupClosed: props.group ? props.group.closed : false,
                groupEscalated: props.group ? props.group.escalated : false,
                groupLocation: props.group ? props.group.locationName : "",
                groupAssignedTo: props.group ? props.group.assignedTo?._id : "",
                groupNotes: props.group ? props.group.notes : "",
              }}
              validationSchema={groupEditSchema}
              onSubmit={(values, {setSubmitting, resetForm}) => {
                if (props.group) {
                  editGroupMutation.mutate(formValuesToGroup(values));
                } else {
                  newGroupMutation.mutate(formValuesToGroup(values));
                }
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
                  <Form>
                    <Modal.Header closeButton>
                      <Modal.Title>Edit group</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Container>
                        <FormGroup controlId="formUsername" className={"mb-3"}>
                          <FormLabel>Name</FormLabel>
                          <Field
                              type="text"
                              className="form-control"
                              name="groupName"
                          />
                        </FormGroup>
                        <FormGroup controlId="formUserEmail" className={"mb-3"}>
                          <FormLabel>Location</FormLabel>
                          <Field
                              name="groupLocation"
                              type="text"
                              className="form-control"
                          />
                        </FormGroup>
                        <Row>
                          <Col md>
                            <FormGroup controlId="formGroupEscalated" className={"mb-3"}>
                              <FormCheck
                                  checked={values.groupEscalated}
                                  type="switch"
                                  label="Escalated"
                                  onChange={handleChange}
                                  name="groupEscalated"
                              />
                            </FormGroup>
                          </Col>
                          <Col md>
                            <FormGroup controlId="formGroupClosed" className={"mb-3"}>
                              <FormCheck
                                  checked={values.groupClosed}
                                  type="switch"
                                  label="Closed"
                                  onChange={handleChange}
                                  name="groupClosed"
                              />
                            </FormGroup>
                          </Col>
                        </Row>
                        <FormGroup controlId="formUserRole" className={"mb-3"}>
                          <FormLabel>Veracity</FormLabel>
                          <Field
                              as={"select"}
                              name="groupVeracity"
                              className="form-select"
                          >
                            {veracityOptions.map((option) => {
                              return <option key={option}>{option}</option>
                            })}
                          </Field>
                        </FormGroup>
                        <FormGroup controlId="formUserRole" className={"mb-3"}>
                          <FormLabel>Assigned to</FormLabel>
                          <Field
                              as={"select"}
                              name="groupAssignedTo"
                              className="form-select"
                          >
                            <option key="none" value={""}>None</option>
                            {usersQuery.isSuccess && usersQuery.data && usersQuery.data.map((user) => {
                              return <option key={user._id} value={user._id}>{user.username}</option>
                            })}
                          </Field>
                        </FormGroup>
                        <FormGroup controlId="formGroupNotes" className={"mb-3"}>
                          <FormLabel>Notes</FormLabel>
                          <Field
                              as={"textarea"}
                              placeholder={"Write notes here."}
                              style={{ height : '100px'}}
                              name="groupNotes"
                              className="form-control"
                          />
                        </FormGroup>
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
  );
}