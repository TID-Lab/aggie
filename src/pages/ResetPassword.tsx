

import React, {useState} from 'react';
import {Container, Col, Row, Card, Form, Button, Image, Alert} from "react-bootstrap";
import { Formik } from "formik";
import axios from "axios";
import * as Yup from "yup";
import {useLocation, useNavigate} from "react-router-dom";

const resetFormSchema = Yup.object().shape({
  resetOldPassword: Yup.string().required('Old Password required'),
  resetNewPassword: Yup.string().required('New Password required'),
  resetNewPasswordConfirm: Yup.string().required('New Password required')
});

interface IProps {
}

const ResetPassword = (props: IProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ showIncorrectMessage, setShowIncorrectMessage ] = useState<boolean>(false);
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
              <Card className={"mt-4"}>
                <Card.Body>
                  <h2 className={"mb-3 text-center"}>Reset Password</h2>
                  <Alert show={showIncorrectMessage} variant={"danger"}>
                    <span>{"Your username and password combination was not correct, please try again."}</span>
                  </Alert>
                  <Formik
                      initialValues={{resetNewPassword: "", resetNewPasswordConfirm: ""}}
                      validationSchema={resetFormSchema}
                      onSubmit={async (values, {setSubmitting, resetForm}) => {
                        axios({
                          method: "POST",
                          url: "/login",
                          data: {
                            password: values.resetNewPassword,
                          },
                          withCredentials: true,
                        }).then((res) => {
                          if (res.status === 200) {
                            console.log("huzzah");
                            window.location.reload();
                          } else {
                            console.log("fail");
                          }
                        }).catch(() => {
                          setShowIncorrectMessage(true);
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
                          <Form.Group controlId="loginForm.formNewPassword" className={"mb-3"}>
                            <Form.Label>New password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="New Password"
                                name="resetNewPassword"
                                onChange={handleChange}
                                value={values.resetNewPassword}
                            />
                          </Form.Group>
                          <Form.Group controlId="loginForm.formNewPassword" className={"mb-3"}>
                            <Form.Label>Confirm new password</Form.Label>
                            <Form.Control
                                required
                                type="password"
                                placeholder="New Password"
                                name="resetNewPasswordConfirm"
                                onChange={handleChange}
                                value={values.resetNewPasswordConfirm}
                            />
                          </Form.Group>
                          <div className="d-flex justify-content-end">
                            <Button variant="primary" type="submit" disabled={isSubmitting}>Submit</Button>
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

export default ResetPassword;




