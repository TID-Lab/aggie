import React, { Component } from 'react';
import {Container, Col, Row, Card, Form, Button} from "react-bootstrap";

const NotFound = () => {
  return (
      <div className={"mt-4"}>
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col lg={8} sm={10}>
              <Card>
                <Card.Header as={"h4"}>404</Card.Header>
                <Card.Body>
                  <p>The webpage you were looking for could not be found. Please contact a system administrator if this is an issue.</p>

                  <Button>Return to previous page</Button>
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

export default NotFound;


