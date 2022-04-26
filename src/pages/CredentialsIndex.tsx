import React, { Component } from 'react';
import axios from 'axios';
import {Container, Col, Row, Card, ButtonToolbar, Placeholder, Button} from "react-bootstrap";
import CredentialTable from "../components/credentials/CredentialTable";
import {useQuery, useQueryClient} from "react-query";
import {getSources} from "../api/sources";
import {getCredentials} from "../api/credentials";
import CredentialModal from "../components/credentials/CredentialModal";
import Table from "react-bootstrap/Table";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";

interface IProps {
}

const CredentialsIndex = (props: IProps) => {
  const queryClient = useQueryClient();
  const credentialsQuery = useQuery("credentials", getCredentials, {

  });
  const placeHolderValues = [3, 5, 4];

  return (
      <div className="mt-4" >
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col xl={9}>
              <Container fluid>
                <h3 className={"mb-4"}>Credentials</h3>
                { credentialsQuery.isSuccess && credentialsQuery.data &&
                <CredentialTable credentials={credentialsQuery.data}></CredentialTable>
                }
                { credentialsQuery.isLoading &&
                    <Card className="mt-3">
                      <Card.Header as={ButtonToolbar} className="justify-content-end">
                        <Button variant={"primary"} disabled>
                          <FontAwesomeIcon icon={faPlusCircle} className="me-2"></FontAwesomeIcon>
                          Create credentials
                        </Button>
                      </Card.Header>
                      <Card.Body>
                        <Table hover>
                          <thead>
                          <tr>
                            <th>Type</th>
                            <th>Name</th>
                            <th></th>
                          </tr>
                          </thead>
                          <tbody>
                          { placeHolderValues.map((value) => {
                            return (
                                <tr key={value}>
                                  <td>
                                    <Placeholder as={Card.Text} animation="glow">
                                      <Placeholder xs={value} />
                                    </Placeholder>
                                  </td>
                                  <td>
                                    <Placeholder as={Card.Text} animation="glow">
                                      <Placeholder xs={1} />
                                    </Placeholder>
                                  </td>
                                  <td>
                                    <Placeholder as={Card.Text} animation="glow">
                                      <Placeholder xs={2} />
                                    </Placeholder>
                                  </td>
                                </tr>
                            );
                          })}
                          </tbody>
                        </Table>
                      </Card.Body>
                    </Card>
                }
                { credentialsQuery.isError &&
                    <Card>
                      <Card.Body>
                        { /*@ts-ignore*/}
                        <h1 className={"text-danger"}>{credentialsQuery.error.response.status} Error</h1>
                        <p>Please contact your system administrator with the error code below. </p>
                        { /*@ts-ignore*/}
                        <small>{credentialsQuery.error.response.status}: {credentialsQuery.error.response.data}</small>
                      </Card.Body>
                    </Card>
                }
              </Container>
            </Col>
            <Col>
              <div className="d-none d-xl-block">
              </div>
            </Col>
          </Row>
        </Container>
      </div>
  );
}

export default CredentialsIndex;
