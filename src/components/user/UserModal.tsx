import {Button, Container, Dropdown, Form, Modal} from "react-bootstrap";
import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle, faEdit} from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import * as Yup from "yup";
import { Formik, FormikValues } from "formik";
import {User, UserCreationData} from "../../objectTypes";
import {useMutation, useQueryClient} from "react-query";
import {editUser, newUser} from "../../api/users";
import {UserEditableData} from "../../objectTypes";

interface IProps {
  user?: User,
  variant: "button" | "dropdown",
  size?: "sm" | "lg",
}

const userFormSchema = Yup.object().shape({
  userUsername: Yup.string()
      .required('Tag name required'),
  userUserRole: Yup.string(),
  userUserEmail: Yup.string(),
  userPassword: Yup.string(),
});

const userRoles = ['viewer', 'monitor', 'admin'];


export default function UserModal(props: IProps) {
  const queryClient = useQueryClient();
  const formValuesToEditUser = (values: FormikValues) => {
    return {
      _id: props.user?._id,
      username: values.userUsername,
      email: values.userEmail,
      role: values.userRole
    }
  };
  const formValuesToCreateUser = (values: FormikValues) => {
    return {
      username: values.userUsername,
      email: values.userEmail,
      role: values.userRole,
      password: values.userPassword,
    }
  };
  const newUserMutation = useMutation((userData: UserCreationData) => {return newUser(userData)}, {
    onSuccess: () => {
      handleModalClose();
      queryClient.invalidateQueries("users");
    }
  })
  const editUserMutation = useMutation((userData: UserEditableData) => {return editUser(userData)}, {
    onSuccess: () => {
      handleModalClose();
      queryClient.invalidateQueries("users");
    }
  });
  const [modalShow, setModalShow] = useState(false);
  const handleModalClose = () => setModalShow(false);
  const handleModalShow = () => setModalShow(true);

  /* Alert state handling */
  const [alertShow, setAlertShow] = useState(false);

  /* Server state handling */
  const [serverState, setServerState] = useState({ok: false, msg: "", res: null});
  const handleServerResponse = (ok: boolean, msg: string, res: any) => {
    if (!ok) setAlertShow(true)
    setServerState({ok: ok, msg: msg, res: res})
  };

  if (props.user) {
    return (
        <>
          {props.variant === "button" &&
          <Button size={props.size ? props.size : undefined} onClick={handleModalShow}><FontAwesomeIcon icon={faEdit}/> Edit</Button>
          }
          {props.variant === "dropdown" &&
          <Dropdown.Item onClick={handleModalShow}><FontAwesomeIcon icon={faEdit}/> Edit</Dropdown.Item>
          }
          <Modal
              show={modalShow}
              onHide={handleModalClose}
              backdrop="static"
              keyboard={false}
          >
            <Formik
                initialValues={{userUsername: props.user.username, userEmail: props.user.email,
                  userRole: props.user.role}}
                validationSchema={userFormSchema}
                onSubmit={async (values, {setSubmitting, resetForm}) => {
                  editUserMutation.mutate(formValuesToEditUser(values));
                }}
            >
              {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleSubmit,
                  isSubmitting,
                  /* and other goodies */
                }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                      <Modal.Title>Edit user: {props.user?.username}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Container>
                        <Form.Group controlId="userUsername" className={"mb-3"}>
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                              type="username"
                              name="userUsername"
                              placeholder="Username"
                              value={values.userUsername}
                              onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group controlId="userEmail" className={"mb-3"}>
                          <Form.Label>Email address</Form.Label>
                          <Form.Control
                              required
                              type="email"
                              name="userEmail"
                              placeholder="Enter email"
                              value={values.userEmail}
                              onChange={handleChange}
                          />
                          <Form.Text className="text-muted">
                            We'll never share your email with anyone else.
                          </Form.Text>
                        </Form.Group>
                        <Form.Group controlId="userRole">
                          <Form.Label>User Role</Form.Label>
                          <Form.Select
                              value={values.userRole}
                              onChange={handleChange}
                          >
                            {userRoles.map((userRole) => {
                              return <option key={userRole}>{userRole}</option>
                            })}
                          </Form.Select>
                        </Form.Group>
                      </Container>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                      <Button variant="primary" type="submit" disabled={isSubmitting}>Save</Button>
                    </Modal.Footer>
                  </Form>
                  )}
            </Formik>
          </Modal>
        </>
    )
  } else {
    return (
        <>
          <Button variant={"primary"} onClick={handleModalShow}>
            <FontAwesomeIcon icon={faPlusCircle} className="me-2"></FontAwesomeIcon>
            Create user
          </Button>
          <Modal
              show={modalShow}
              onHide={handleModalClose}
              backdrop="static"
              keyboard={false}
          >
            <Formik
                initialValues={{userUsername: "", userEmail: "", userRole: "", userPassword: ""}}
                validationSchema={userFormSchema}
                onSubmit={async (values, {setSubmitting, resetForm}) => {
                  newUserMutation.mutate(formValuesToCreateUser(values));
                }}
            >
              {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleSubmit,
                  isSubmitting,
                  /* and other goodies */
                }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                      <Modal.Title>Create user</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Container>
                        <Form.Group controlId="userUsername" className={"mb-3"}>
                          <Form.Label>Username</Form.Label>
                          <Form.Control
                              required
                              type="username"
                              name="userUsername"
                              placeholder="Username"
                              value={values.userUsername}
                              onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group controlId="userEmail" className={"mb-3"}>
                          <Form.Label>Email address</Form.Label>
                          <Form.Control
                              required
                              type="email"
                              name="userEmail"
                              placeholder="Enter email"
                              value={values.userEmail}
                              onChange={handleChange}
                          />
                          <Form.Text className="text-muted">
                            We'll never share your email with anyone else.
                          </Form.Text>
                        </Form.Group>
                        <Form.Group controlId="userPassword" className={"mb-3"}>
                          <Form.Label>Password</Form.Label>
                          <Form.Control
                              required
                              type="text"
                              name="userPassword"
                              placeholder="Enter password"
                              value={values.userPassword}
                              onChange={handleChange}
                          />
                        </Form.Group>
                        <Form.Group controlId="userRole">
                          <Form.Label>User Role</Form.Label>
                          <Form.Select
                              value={values.userRole}
                              onChange={handleChange}
                          >
                            {userRoles.map((userRole) => {
                              return <option key={userRole}>{userRole}</option>
                            })}
                          </Form.Select>
                        </Form.Group>
                      </Container>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                      <Button variant="primary" type="submit" disabled={isSubmitting}>Submit</Button>
                    </Modal.Footer>
                  </Form>
              )}
            </Formik>
          </Modal>
        </>
    )
  }
}