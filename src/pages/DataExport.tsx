import React, {useState} from 'react';
import {Card, Col, Container, Row, Form} from "react-bootstrap";
import ExportCSVModal from "../components/configuration/ExportCSVModal";
import {useMutation, useQuery} from "react-query";

interface IProps {
}

const DataExport = () => {
  return (
      <div>
        <Container fluid className={"mt-4"}>
          <Row>
            <Col>
            </Col>
            <Col xs={9}>
              <Container fluid>
                <h3 className="mb-3">Export data</h3>
                <Card>
                  <Card.Body>
                    <Card.Title>Turn fetching on/off</Card.Title>
                  </Card.Body>
                </Card>
              </Container>
            </Col>
            <Col>
            </Col>
          </Row>
        </Container>
      </div>
  );
}

export default DataExport;
