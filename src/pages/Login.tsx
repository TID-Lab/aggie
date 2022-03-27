import React, {useState} from 'react';
import {Container, Col, Row, Card, Form, Button, Image, Alert} from "react-bootstrap";
import {Formik, FormikValues} from "formik";
import axios from "axios";
import * as Yup from "yup";
import {LoginData, Session} from "../objectTypes";
import {useLocation, useNavigate} from "react-router-dom";
import {logIn} from "../api/session";
import {useMutation} from "react-query";

const loginFormSchema = Yup.object().shape({
  loginUsername: Yup.string().required('Username required'),
  loginPassword: Yup.string().required('Password required'),
});

interface IProps {
}

const Login = (props: IProps) => {
  const loginQuery = useMutation((logInData: LoginData)=>{return logIn(logInData)});
  const formValuesToLogin = (values: FormikValues) => {
    return {
      username: values.loginUsername,
      password: values.loginPassword
    }
  }
  return (
      <div style={{
        background: "linear-gradient(to bottom right, #2D9242, #0d6efd)",
        width: "100%",
        height: "100%",
      }}>
        <Container fluid className={"pt-5"}>
          <Row>
            <Col>
            </Col>
            <Col lg={4} sm={6}>
              <Card className={"mt-5"}>
                <Card.Body>
                  <h2 className={"mb-3 text-center"}>Login</h2>
                  <Alert show={loginQuery.isError} variant={"danger"}>
                    <span>{"Your username and password combination was not correct, please try again."}</span>
                  </Alert>

                  <Formik
                      initialValues={{loginUsername: "", loginPassword: ""}}
                      validationSchema={loginFormSchema}
                      onSubmit={(values, {setSubmitting, resetForm}) => {
                        loginQuery.mutate(formValuesToLogin(values))
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
                            <Button variant="primary" type="submit">Sign in</Button>
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