import React from 'react';
import {Container, Col, Row, Card, Form, Button} from "react-bootstrap";
import { Formik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import {Session} from "../objectTypes";
import {useLocation, useNavigate} from "react-router-dom";

const loginFormSchema = Yup.object().shape({
  loginUsername: Yup.string().required('Username required'),
  loginPassword: Yup.string().required('Password required'),
});

interface IProps {
}

const Login = (props: IProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
      <div className={"mt-5"}>
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col lg={4} sm={6}>
              <Card>
                <Card.Header as={"h5"}>Login</Card.Header>
                <Card.Body>
                  <Formik
                      initialValues={{loginUsername: "", loginPassword: ""}}
                      validationSchema={loginFormSchema}
                      onSubmit={async (values, {setSubmitting, resetForm}) => {
                        axios({
                          method: "POST",
                          url: "/login",
                          data: {
                            username: values.loginUsername,
                            password: values.loginPassword,
                          },
                          withCredentials: true,
                        }).then((res) => {
                          if (res.status === 200) {
                            console.log("huzzah");
                          } else {
                           console.log("ERR")
                          }
                        });
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
                            <Form.Group controlId="loginForm.formUsername" className={"mb-3"}>
                              <Form.Label>Username</Form.Label>
                              <Form.Control
                                  required
                                  type="text"
                                  placeholder="Username"
                                  name="loginUsername"
                                  onChange={handleChange}
                                  value={values.loginUsername}
                              />
                            </Form.Group>
                            <Form.Group controlId="loginForm.formPassword" className={"mb-3"}>
                              <Form.Label>Password</Form.Label>
                              <Form.Control
                                  required
                                  type="password"
                                  placeholder="Password"
                                  name="loginPassword"
                                  onChange={handleChange}
                                  value={values.loginPassword}
                              />
                            </Form.Group>
                            <div className="d-flex justify-content-between">
                              <Button variant="link">Forgot your username?</Button>
                              <Button variant="primary" type="submit" disabled={isSubmitting}>Sign in</Button>
                            </div>
                          </Form>
                        )}
                  </Formik>
                </Card.Body>
              </Card>
            </Col>
            <Col>
            </Col>
          </Row>
        </Container>
      </div>
  );
}

export default Login;


