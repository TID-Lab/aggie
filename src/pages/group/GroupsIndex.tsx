import {Groups, GroupSearchState, ReportSearchState, Source, Tag, User} from "../../objectTypes";
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
import GroupTable, {GroupRow, LoadingGroupTable} from "../../components/group/GroupTable";
import StatsBar from '../../components/StatsBar';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faPlusCircle,
  faSearch,
  faSlidersH,
} from "@fortawesome/free-solid-svg-icons";
import {useQuery, useQueryClient} from "react-query";
import {getSources} from "../../api/sources";
import {getGroups} from "../../api/groups";
import {getTags} from "../../api/tags";
import {getUsers} from "../../api/users";
import {useNavigate, useSearchParams} from "react-router-dom";
import GroupModal from "../../components/group/GroupModal";
import {AxiosError} from "axios";
import ErrorCard from "../../components/ErrorCard";
import AggiePagination from "../../components/AggiePagination";
const ITEMS_PER_PAGE = 50;

interface IProps {
}

const GroupsIndex = (props: IProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const queryTags = useState<Tag[] | []>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchState, setSearchState] = useState<GroupSearchState>({
    locationName: searchParams.get("locationName"),
    veracity: searchParams.get("veracity"),
    escalated: searchParams.get("escalated") === "true",
    closed: searchParams.get("closed") === "true",
    totalReports: Number(searchParams.get("totalReports")),
    assignedTo: searchParams.get("assignedTo"),
    creator: searchParams.get("creator"),
    title: searchParams.get("title"),
    after: searchParams.get("after"),
    before: searchParams.get("before"),
    idnum: Number(searchParams.get("idnum")),
    page: Number(searchParams.get("page") || "0")
  });

  const [showFilterParams, setShowFilterParams] = useState(false);
  const sourcesQuery = useQuery<Source[] | undefined, AxiosError>("sources", getSources, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });
  const groupsQuery = useQuery<Groups | undefined, AxiosError>("groups", ()=>{return getGroups(searchState)}, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });
  const tagsQuery = useQuery<Tag[] | undefined, AxiosError>("tags", getTags, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });
  const usersQuery = useQuery<User[] | undefined, AxiosError>("users", getUsers, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });


  const goToPage = (pageNum: number) => {
    setSearchState({
      ...searchState,
      page: pageNum
    });
    setSearchParams({
      ...searchParams,
      page: String(pageNum)
    });
    queryClient.invalidateQueries("groups")
    groupsQuery.refetch();
  }
  return (
      <div>
        <Container fluid className={"mt-4"}>
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
                                <option value={"confirmed true"}>Confirmed true</option>
                                <option value={"confirmed false"}>Confirmed false</option>
                                <option value={"unconfirmed"}>Unconfirmed</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md>
                            <Form.Group controlId="searchPlatform">
                              <Form.Label>Escalated</Form.Label>
                              <Form.Select aria-label="Default select example">
                                <option>All</option>
                                <option value={"true"}>Yes</option>
                                <option value={"false"}>No</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md>
                            <Form.Group controlId="searchSource">
                              <Form.Label>Assigned To</Form.Label>
                              <Form.Select aria-label="Source search select">
                                <option>All</option>
                                {usersQuery.isFetched && usersQuery.data && usersQuery.data.map((user: User) => {
                                  return (
                                      <option value={user._id} key={user._id}>
                                        {user.username}
                                      </option>
                                  )
                                })}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md>
                            <Form.Group controlId="search">
                              <Form.Label>Created By</Form.Label>
                              <Form.Select aria-label="Default select example">
                                <option>All</option>
                                {usersQuery.isFetched && usersQuery.data && usersQuery.data.map((user: User) => {
                                  return (
                                      <option value={user._id} key={user._id}>
                                        {user.username}
                                      </option>
                                  )
                                })}
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
              { groupsQuery.isSuccess && sourcesQuery.isSuccess && tagsQuery.isSuccess && usersQuery.isSuccess &&
                  groupsQuery.data && sourcesQuery.data && tagsQuery.data && usersQuery.data &&
                  <Card>
                    <Card.Header>
                      <ButtonToolbar className={"justify-content-between"}>
                        <GroupModal/>
                        <div>
                          { groupsQuery.data.total &&
                              <AggiePagination itemsPerPage={50} total={groupsQuery.data.total} goToPage={goToPage}/>
                          }
                        </div>
                      </ButtonToolbar>
                    </Card.Header>
                    <GroupTable
                        visibleGroups={groupsQuery.data.results}
                        sources={sourcesQuery.data}
                        tags={tagsQuery.data}
                        users={usersQuery.data}
                    />
                    <Card.Footer>
                      <ButtonToolbar className={"justify-content-end"}>
                        { groupsQuery.data && groupsQuery.data.total &&
                            <AggiePagination itemsPerPage={50} total={groupsQuery.data.total} goToPage={goToPage}/>
                        }
                      </ButtonToolbar>
                    </Card.Footer>
                  </Card>
              }
              {/* QUERY ERROR STATE */}
              {groupsQuery.isError &&
              <>
                {groupsQuery.error.response && groupsQuery.error.response.status && groupsQuery.error.response.data &&
                    <ErrorCard
                        errorStatus={groupsQuery.error.response.status}
                        errorData={groupsQuery.error.response.data}
                    />
                }
              </>
              }
              {/* LOADING STATE: TODO: Move this to the GroupTable component file */}
              { groupsQuery.isLoading &&
                  <LoadingGroupTable/>
              }
              <div className={"pb-5"}></div>
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
