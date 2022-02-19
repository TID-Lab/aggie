import {Source} from "../../objectTypes";
import React, {useState} from 'react';
import {
  Container,
  Card,
  Col,
  Row,
  Form,
  Button,
  InputGroup,
  FormControl,
  Collapse,
  ButtonToolbar, ButtonGroup, Table, Pagination, Dropdown, Placeholder
} from "react-bootstrap";
import GroupTable, {GroupRow} from "../../components/group/GroupTable";
import StatsBar from '../../components/StatsBar';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faEllipsisV,
  faPlusCircle,
  faSearch,
  faSlidersH,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import {useQuery, useQueryClient} from "react-query";
import {getSources} from "../../api/sources";
import {getGroups} from "../../api/groups";
import {getTags} from "../../api/tags";
import {getUsers} from "../../api/users";
import GroupModal from "../../components/group/GroupModal";
import {Link} from "react-router-dom";
import {faCircle} from "@fortawesome/free-regular-svg-icons";
import Linkify from "linkify-react";
import {stringToDate} from "../../helpers";
import TagsTypeahead from "../../components/tag/TagsTypeahead";
import EllipsisToggle from "../../components/EllipsisToggle";
import ConfirmModal from "../../components/ConfirmModal";

interface IProps {
}

const GroupsIndex = (props: IProps) => {
  const queryClient = useQueryClient();
  const sourcesQuery = useQuery("sources", getSources);
  const groupsQuery = useQuery("groups", getGroups);
  const tagsQuery = useQuery("tags", getTags);
  const usersQuery = useQuery("users", getUsers);

  const [showFilterParams, setShowFilterParams] = useState(false);

  return (
      <div>
        <Container fluid className={"mt-2"}>
          <Row>
            <Col>
            </Col>
            <Col xl={9}>
              <Card className="mb-4">
                <Card.Body>
                  <InputGroup>
                    <FormControl
                        placeholder="Search groups"
                        aria-label="Search groups"
                        aria-describedby="basic-addon2"
                    />
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowFilterParams(!showFilterParams)}
                        aria-controls="filterParams"
                        aria-expanded={showFilterParams}
                    >
                      <FontAwesomeIcon icon={faSlidersH}/>
                    </Button>
                  </InputGroup>
                  <Form>
                    <Collapse in={showFilterParams}>
                      <div id="filterParams">
                        <Row className="mb-3 mt-3">
                          <Col md>
                            <Form.Group controlId="searchName">
                              <Form.Label>Name</Form.Label>
                              <Form.Control placeholder="Search by name"/>
                            </Form.Group>
                          </Col>
                          <Col md>
                            <Form.Group controlId="searchTag">
                              <Form.Label>Tag</Form.Label>
                              <Form.Control placeholder="Search by tag"/>
                            </Form.Group>
                          </Col>
                          <Col md>
                            <Form.Group controlId="searchAuthor">
                              <Form.Label>ID#</Form.Label>
                              <Form.Control placeholder="Search by ID#"/>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md>
                            <Form.Group controlId="searchVeracity">
                              <Form.Label>Veracity</Form.Label>
                              <Form.Select aria-label="Default select example">
                                <option>All</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md>
                            <Form.Group controlId="searchPlatform">
                              <Form.Label>Escalated</Form.Label>
                              <Form.Select aria-label="Default select example">
                                <option>All</option>
                                {sourcesQuery.isFetched && sourcesQuery.data &&
                                sourcesQuery.data.map((source: Source) => {
                                  return (
                                      <option value={source._id} key={source._id}>
                                        {source.nickname}
                                      </option>
                                  )
                                })}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md>
                            <Form.Group controlId="searchSource">
                              <Form.Label>Assigned To</Form.Label>
                              <Form.Select aria-label="Source search select">
                                <option>All</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md>
                            <Form.Group controlId="search">
                              <Form.Label>Created By</Form.Label>
                              <Form.Select aria-label="Default select example">
                                <option>All</option>
                                <option value="1">One</option>
                                <option value="2">Two</option>
                                <option value="3">Three</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md>
                            <Button variant={"secondary"}> Date Created </Button>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Button variant={"primary"}><FontAwesomeIcon icon={faSearch}/> Search </Button>
                          </Col>
                        </Row>
                      </div>
                    </Collapse>
                  </Form>
                </Card.Body>
              </Card>
              { groupsQuery.isFetched && sourcesQuery.isFetched && tagsQuery.isFetched && usersQuery.isFetched &&
                  groupsQuery.data && sourcesQuery.data && tagsQuery.data && usersQuery.data &&
                <GroupTable
                    visibleGroups={groupsQuery.data.results}
                    sources={sourcesQuery.data}
                    tags={tagsQuery.data}
                    users={usersQuery.data}
                />
              }
              {/* QUERY ERROR STATE: TODO: Put this in the GroupTable Component, it makes more sense there. */}
              {groupsQuery.isError &&
              <Card>
                <Card.Body>
                  { /*@ts-ignore*/}
                  <h1 className={"text-danger"}>{groupsQuery.error.response.status} Error</h1>
                  <p>Please contact your system administrator with the error code below. </p>
                  { /*@ts-ignore*/}
                  <small>{groupsQuery.error.response.status}: {groupsQuery.error.response.data}</small>
                </Card.Body>
              </Card>
              }
              {/* LOADING STATE: TODO: Move this to the GroupTable component file */}
              { groupsQuery.isLoading &&
                  <Card>
                    <Card.Header>
                      <ButtonToolbar
                          className="justify-content-end"
                          aria-label="Toolbar with Button groups"
                      >
                        <ButtonGroup className={"me-2"}>
                          <Button variant={"primary"}>
                            <FontAwesomeIcon icon={faPlusCircle} className={"me-1"}></FontAwesomeIcon>
                            <span> Create group </span>
                          </Button>
                        </ButtonGroup>
                      </ButtonToolbar>
                    </Card.Header>
                    <Table striped bordered hover>
                      <thead>
                      <tr>
                        <th>
                          <Form>
                            <Form.Check
                                type="checkbox"
                                id={"select-all"}
                            />
                          </Form>
                        </th>
                        <th>#</th>
                        <th>Title</th>
                        <th>Location</th>
                        <th>Notes</th>
                        <th>Assigned To</th>
                        <th>Creation Info</th>
                        <th>Tags</th>
                        <th></th>
                      </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>
                            <Form>
                              <Form.Check
                                  type="checkbox"
                                  disabled
                              />
                            </Form>
                          </td>
                          <td><Placeholder animation="glow">
                            <Placeholder xs={6} ></Placeholder>
                          </Placeholder></td>
                          <td>
                            <Placeholder animation="glow">
                              <Placeholder xs={12} ></Placeholder>
                            </Placeholder>
                            <br/>
                            <small>
                              <Placeholder animation="glow">
                                <Placeholder xs={3} ></Placeholder>
                              </Placeholder>
                              {' '}reports
                            </small>
                          </td>
                          <td className="text-break">
                            <Placeholder animation="glow">
                              <Placeholder xs={12} ></Placeholder>
                            </Placeholder>
                          </td>
                          <td>
                            <Placeholder animation="glow">
                              <Placeholder xs={12} ></Placeholder>
                              <Placeholder xs={12} ></Placeholder>
                            </Placeholder>
                          </td>
                          <td>
                            <Placeholder animation="glow">
                              <Placeholder xs={8} ></Placeholder>
                            </Placeholder>
                          </td>
                          <td>
                            <Placeholder animation="glow">
                              <Placeholder xs={9} ></Placeholder>
                            </Placeholder>
                            <br/>
                            <small>
                              <Placeholder animation="glow">
                                <Placeholder xs={3} ></Placeholder>
                              </Placeholder>
                            </small>
                          </td>
                          <td>
                            <Form.Control
                                as="textarea"
                                style={{ height: '80px' }}
                                disabled
                            />
                          </td>
                          <td>
                            <FontAwesomeIcon icon={faEllipsisV}></FontAwesomeIcon>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                    <Card.Footer className="justify-center">
                      <div className="d-flex justify-content-center">
                        <Pagination size={'sm'}>
                          <Pagination.First />
                          <Pagination.Prev />
                          <Pagination.Item>{1}</Pagination.Item>
                          <Pagination.Ellipsis />
                          <Pagination.Item>{10}</Pagination.Item>
                          <Pagination.Item>{11}</Pagination.Item>
                          <Pagination.Item active>{12}</Pagination.Item>
                          <Pagination.Item>{13}</Pagination.Item>
                          <Pagination.Item disabled>{14}</Pagination.Item>
                          <Pagination.Ellipsis />
                          <Pagination.Item>{20}</Pagination.Item>
                          <Pagination.Next />
                          <Pagination.Last />
                        </Pagination>
                      </div>
                    </Card.Footer>
                  </Card>
              }
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

export default GroupsIndex;
