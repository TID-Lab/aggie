import React from 'react';
import {
  Container,
  Col,
  Row,
  Card,
  Table,
  ButtonGroup,
  ButtonToolbar,
  Image,
  Form
} from "react-bootstrap";
import StatsBar from '../../components/StatsBar';
import ConfirmModal from "../../components/ConfirmModal";
import SourceModal from "../../components/source/SourceModal";
import {capitalizeFirstLetter} from "../../helpers";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {editSource, getSource} from "../../api/sources";
import {useParams} from "react-router-dom";
import {Credential, Source, SourceEvent} from "../../objectTypes";
import {getCredentials} from "../../api/credentials";

const SourceDetails = () => {
  let { id } = useParams<{id: string}>();
  const queryClient = useQueryClient();
  const sourceQuery = useQuery(["source", id], () => getSource(id));
  const credentialsQuery = useQuery<Credential[] | undefined>("credentials", getCredentials);
  const sourceMutation = useMutation((sourceData: any) => {return editSource(sourceData)});
  const handleChange = (source: Source | null) => {
    if (source) {
      source.enabled = !source.enabled;
      sourceMutation.mutate(source);
    } else {
      console.error("A non-existent source was attempted to be changed.");
    }
  }
  return (
      <div className="mt-4">
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col md={9}>
              <Container>
                <h3>Source details</h3>
                { sourceQuery.isSuccess &&
                <Card className="mt-3">
                  <Card.Header>
                    <ButtonToolbar
                        className="justify-content-end"
                        aria-label="Toolbar with Button groups"
                    >
                      <ButtonGroup className={"me-2"}>
                        {sourceQuery.data && credentialsQuery.data &&
                        <SourceModal
                            source={sourceQuery.data}
                            variant={"button"}
                            credentials={credentialsQuery.data}
                        />
                        }
                      </ButtonGroup>
                      <ButtonGroup>
                        <ConfirmModal type={"delete"} source={sourceQuery.data} variant={"button"}></ConfirmModal>
                      </ButtonGroup>
                    </ButtonToolbar>
                  </Card.Header>
                  <Card.Body>
                    <Table>
                      <tbody>
                        <tr>
                          <th>Name</th>
                          <td>{sourceQuery.data.nickname}</td>
                        </tr>
                        <tr>
                          <th>Media source</th>
                          <td>
                            <Image src={"/images/" + sourceQuery.data.media + ".png"} rounded className={"me-2"}/>
                            {capitalizeFirstLetter(sourceQuery.data.media)}
                          </td>
                        </tr>
                        <tr>
                          <th>Tags</th>
                          <td>{sourceQuery.data.tags}</td>
                        </tr>
                        <tr>
                          <th>Created by</th>
                          <td>{sourceQuery.data.user.username}</td>
                        </tr>
                        <tr>
                          <th>Credentials</th>
                          <td>{sourceQuery.data.credentials.name}</td>
                        </tr>
                        <tr>
                          <th>Enabled</th>
                          <td>
                            <Form>
                              <Form.Switch
                                  id={sourceQuery.data._id}
                                  defaultChecked={sourceQuery.data.enabled}
                                  onChange={(e) => handleChange(sourceQuery.data)}
                              />
                            </Form>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                    <br/>
                    <Card.Title>Source Events</Card.Title>
                    <Table>
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Level</th>
                          <th>Message</th>
                        </tr>
                      </thead>
                      <tbody>
                      { sourceQuery.data.events && sourceQuery.data.events.length > 0 &&
                        sourceQuery.data.events.map((event: SourceEvent) => {
                          return (
                              <tr>
                                <td>{event.datetime}</td>
                                <td>{event.type}</td>
                                <td>{event.message}</td>
                              </tr>
                          )
                        })
                      }
                      { sourceQuery.data.events && sourceQuery.data.events.length === 0 &&
                          <tr>
                            <td>No recent events found</td>
                            <td></td>
                            <td></td>
                          </tr>
                      }
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
                }
              </Container>
            </Col>
            <Col>
              <div className="d-none d-xl-block">
                <StatsBar></StatsBar>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
  );
}

export default SourceDetails;


