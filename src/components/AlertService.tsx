import React from 'react';
import {Alert, Col, Container, Row} from "react-bootstrap";

export interface AlertContent {
  heading: string,
  message: string,
  variant: "primary" | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'light' | 'dark',
}

interface IProps {
  globalAlert: AlertContent,
  setGlobalAlert: (globalAlert: AlertContent) => void;
}

const AlertService = (props: IProps) => {
  if (props.globalAlert.heading !== "") {
    return (
        <Container fluid>
          <Row>
            <Col></Col>
            <Col xl={9}>
              <div className="mt-4">
                <Alert variant={props.globalAlert.variant} onClose={()=>props.setGlobalAlert({heading: "", message:"", variant: "primary"})} dismissible>
                  <Alert.Heading>{props.globalAlert.heading}</Alert.Heading>
                  <p>
                    {props.globalAlert.message}
                  </p>
                </Alert>
              </div>
            </Col>
            <Col></Col>
          </Row>
        </Container>
    );
  } else return <></>
}

export default AlertService;


