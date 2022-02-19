import React, {useState} from 'react';
import {Card, Col, Container, Row, Form} from "react-bootstrap";
import ExportCSVModal from "../components/configuration/ExportCSVModal";
import {useMutation, useQuery} from "react-query";
import {getEmailSettings, getFetchStatus, putFetchingStatus} from "../api/configuration";

interface IProps {
}

const Configuration = () => {
  const [fetchStatus, setFetchStatus] = useState<boolean>(false);
  const [appEmail, setAppEmail] = useState("");
  const emailSettingsQuery = useQuery("emailSettings", getEmailSettings,{
    onSuccess: data => {console.log(data)}
  });
  const fetchStatusQuery = useQuery("fetchStatus", getFetchStatus, {
    onSuccess: data => {if (data.fetching) {setFetchStatus(data.fetching)}}
  });
  const fetchStatusMutation = useMutation((fetching: boolean) => {return putFetchingStatus(fetching)}, {
    onSuccess: () => {
      setFetchStatus(!fetchStatus)
      console.log("Fetching is on: " + !fetchStatus )
    }
  });

  return (
      <div className={"mt-2"}>
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col xs={9}>
              <Container fluid>
                <Card>
                  <Card.Header as="h5">Configuration</Card.Header>
                  <Card.Body>
                    <Card.Title>Turn fetching on/off</Card.Title>
                    <Form className={"mb-3"}>
                      { fetchStatusQuery.isFetched && fetchStatusQuery.data &&
                      <Form.Check
                          type="switch"
                          id="custom-switch"
                          checked={fetchStatus}
                          onChange={() => {fetchStatusMutation.mutate(!fetchStatus)}}
                      />
                      }
                    </Form>
                    <h5>Email Settings</h5>
                    <Form>
                      { emailSettingsQuery.isFetched && emailSettingsQuery.data &&
                      <Form.Group className={"mb-3"}>
                        <Form.Label>App Email Address</Form.Label>
                        <Form.Control
                            required
                            type="email"
                            placeholder="example@domain.com"
                            value={appEmail}
                        />
                        <Form.Text className="text-muted">
                            This email will send account set-up emails and password reset emails.
                        </Form.Text>
                      </Form.Group>
                      }
                      <Form.Group className={"mb-3"}>
                        <Form.Label>Email Transport Configuration</Form.Label>
                        <Form.Control
                            required
                            type="email"
                            placeholder="First name"
                            readOnly
                        />
                      </Form.Group>
                    </Form>
                    <Row>
                      <Col>
                        <h5>CSV Export</h5>
                        <ExportCSVModal/>
                      </Col>
                    </Row>
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

export default Configuration;
