import React from 'react';
import {Container, Col, Row, Card, ButtonToolbar, Table, Button, Image, Form, Dropdown} from "react-bootstrap";
import StatsBar from '../../components/StatsBar';
import SourceTable from "../../components/source/SourceTable";
import {useQuery, useQueryClient} from "react-query";
import {getSources} from "../../api/sources";
import {getCredentials} from "../../api/credentials";
import {Credential, Source} from "../../objectTypes";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisV, faPlusCircle} from "@fortawesome/free-solid-svg-icons";

interface IProps {
}

const SourcesIndex = (props: IProps) => {
  const queryClient = useQueryClient();
  const sourcesQuery = useQuery<Source[] | undefined>("sources", getSources);
  const credentialsQuery = useQuery<Credential[] | undefined>("credentials", getCredentials);

  // Initialize the state
  return (
      <div className="mt-4">
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col xl={9}>
              { sourcesQuery.isSuccess && credentialsQuery.isSuccess && sourcesQuery.data && credentialsQuery.data &&
              <SourceTable sources={sourcesQuery.data} credentials={credentialsQuery.data}/>
              }
              {/* QUERY ERROR STATE: TODO: Put this in the SourceTable Component, it makes more sense there. */}
              { sourcesQuery.isError &&
              <Card>
                <Card.Body>
                  { /*@ts-ignore*/}
                  <h1 className={"text-danger"}>{sourcesQuery.error.response.status} Error</h1>
                  <p>Please contact your system administrator with the error code below. </p>
                  { /*@ts-ignore*/}
                  <small>{sourcesQuery.error.response.status}: {sourcesQuery.error.response.data}</small>
                </Card.Body>
              </Card>
              }
              { sourcesQuery.isLoading &&
                  <Card className="mt-3">
                    <Card.Header as={ButtonToolbar} className="justify-content-end">
                      <Button variant={"primary"}>
                        <FontAwesomeIcon icon={faPlusCircle} className="me-2"></FontAwesomeIcon>
                        Create source
                      </Button>
                    </Card.Header>
                    <Card.Body>
                      <Table hover>
                        <thead>
                        <tr>
                          <th>Media</th>
                          <th>Name</th>
                          <th>Credential</th>
                          <th>Keywords</th>
                          <th>Notes</th>
                          <th>New Warnings</th>
                          <th>Enabled</th>
                          <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td></td>
                          <td>
                            <Form>
                              <Form.Switch
                                  disabled
                              />
                            </Form>
                          </td>
                          <td>
                            <FontAwesomeIcon icon={faEllipsisV}></FontAwesomeIcon>
                          </td>
                        </tr>
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
              }
            </Col>
            <Col>
              <div className="d-none d-xl-block">
                <StatsBar/>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
  );
}

export default SourcesIndex;
