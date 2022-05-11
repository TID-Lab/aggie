import {
  ClosedOptions,
  EscalatedOptions,
  Groups,
  GroupSearchState,
  Source,
  Tag,
  User,
  VeracityOptions
} from "../../objectTypes";
import React, {useState} from 'react';
import {
  Container,
  Card,
  Col,
  Row,
  Button,
  InputGroup,
  FormLabel,
  FormGroup,
  Collapse,
  ButtonToolbar
} from "react-bootstrap";
import GroupTable, {LoadingGroupTable} from "../../components/group/GroupTable";
import StatsBar from '../../components/StatsBar';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faClose,
  faFilter, faPlusCircle,
  faSearch,
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
import AggiePagination, {LoadingPagination} from "../../components/AggiePagination";
import {Field, Formik, Form} from "formik";
import {CLOSED_OPTIONS, ESCALATED_OPTIONS, parseFilterFields, VERACITY_OPTIONS} from "../../helpers";
import DatePickerField from "../../components/DatePickerField";
import TagsTypeahead from "../../components/tag/TagsTypeahead";
const ITEMS_PER_PAGE = 50;

interface IProps {
}

const GroupsIndex = (props: IProps) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [filterTags, setFilterTags] = useState<Tag[] | []>([]);
  const [searchParams, setSearchParams] = useSearchParams();

  // This
  const [queryState, setQueryState] = useState<GroupSearchState>({
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

  // This clears search state and search params
  const clearFilterParams = () => { setSearchParams({}); setQueryState({
    locationName: queryState.locationName,
    title: queryState.title,
    idnum: queryState.idnum,
    veracity: null,
    escalated: null,
    closed: null,
    totalReports: null,
    assignedTo: null,
    creator: null,
    after: null,
    before: null,
    page: null,
  });
  };

  const hasValues = (values: any) => {
    if (values.escalated || values.closed || values.after || values.before ||
        values.totalReports || values.assignedTo || values.creator || values.veracity) {
      return true;
    } else {
      return false;
    }
  }

  const [showFilterParams, setShowFilterParams] = useState(false);
  const sourcesQuery = useQuery<Source[] | undefined, AxiosError>("sources", getSources, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });
  const groupsQuery = useQuery<Groups | undefined, AxiosError>(["groups", queryState], ()=>{return getGroups(queryState)}, {
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
    setQueryState({
      ...queryState,
      page: pageNum
    });
    setSearchParams({
      ...searchParams,
      page: String(pageNum)
    });
  }
  return (
      <div>
        <Container fluid className={"mt-4"}>
          <Row>
            <Col>
            </Col>
            <Col xl={9}>
              <Formik
                  initialValues={{
                    creator: searchParams.get("creator") || "",
                    idnum: searchParams.get("idnum") || "",
                    veracity: searchParams.get("veracity") || "",
                    escalated: searchParams.get("escalated") || "",
                    closed: searchParams.get("closed") || "",
                    before: searchParams.get("before") || "",
                    after: searchParams.get("after") || "",
                    totalReports: searchParams.get("totalReports") || "",
                    assignedTo: searchParams.get("assignedTo") || ""
                  }}
                  onSubmit={(values, {setSubmitting, resetForm}) => {
                    setSearchParams(parseFilterFields(values));
                    setQueryState(parseFilterFields(values));
                  }}
              >
                {({
                    values,
                    errors,
                    handleSubmit
                  }) => (
                    <Form>
                      <Card className="mb-3" bg="light">
                        <Card.Body className="pb-2 pt-2">
                          <Row className={"justify-content-between"}>
                            <Col>
                              <InputGroup className={"mt-2 mb-2"}>
                                <Field id="keyword" name="keywords" placeholder="Search by group name, location, or notes" className="form-control"/>
                                <Button variant="primary" type="submit">
                                  <FontAwesomeIcon icon={faSearch}/>
                                </Button>
                              </InputGroup>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                      <Collapse in={showFilterParams}>
                        <Card className="mb-4" bg="light">
                          <Card.Body>
                            <Row>
                              <Col md>
                                <FormGroup controlId="searchVeracity" className="mb-2 mt-2">
                                  <FormLabel>Veracity</FormLabel>
                                  <Field as="select" name="veracity" className="form-select">
                                    <option key={"none"} value={""}>All</option>
                                    {VERACITY_OPTIONS.map((option)=> {
                                      return <option value={option} key={"veracity_" + option}>{option}</option>
                                    })}
                                  </Field>
                                </FormGroup>
                              </Col>
                              <Col md>
                                <FormGroup controlId="searchPlatform" className="mb-2 mt-2">
                                  <FormLabel>Escalated</FormLabel>
                                  <Field as="select" name="escalated" className="form-select">
                                    <option value="">All</option>
                                    {ESCALATED_OPTIONS.map((option) => {
                                      return <option value={option} key={"escalated_" + option}>{option === "true" ? "Yes" : "No"}</option>
                                    })}
                                  </Field>
                                </FormGroup>
                              </Col>
                              <Col md>
                                <FormGroup controlId="searchSource" className="mb-2 mt-2">
                                  <FormLabel>Assignee</FormLabel>
                                  <Field as="select" name="assignedTo" className="form-select">
                                    <option value={""}>All</option>
                                    {usersQuery.isFetched && usersQuery.data && usersQuery.data.map((user: User) => {
                                      return (
                                          <option value={user._id} key={user._id}>
                                            {user.username}
                                          </option>
                                      )
                                    })}
                                  </Field>
                                </FormGroup>
                              </Col>
                              <Col md>
                                <FormGroup controlId="search" className="mb-2 mt-2">
                                  <FormLabel>Creator</FormLabel>
                                  <Field as="select" name="creator" className="form-select">
                                    <option value={""} key={"none"}>All</option>
                                    {usersQuery.isFetched && usersQuery.data && usersQuery.data.map((user: User) => {
                                      return (
                                          <option value={user._id} key={user._id}>
                                            {user.username}
                                          </option>
                                      )
                                    })}
                                  </Field>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row>
                              <Col md>
                                <FormGroup controlId="searchPlatform" className="mb-2 mt-2">
                                  <FormLabel>Closed</FormLabel>
                                  <Field as="select" name="closed" className="form-select">
                                    <option value={""} key={"none"}>All</option>
                                    {CLOSED_OPTIONS.map((option) => {
                                      return <option value={option} key={"closed_"+option}>{option === "true" ? "Yes" : "No"}</option>
                                    })}
                                  </Field>
                                </FormGroup>
                              </Col>
                              <Col md>
                                <FormGroup className="mt-2 mb-2">
                                  <FormLabel >Tags</FormLabel>
                                  { tagsQuery.isFetched &&
                                      <TagsTypeahead
                                          options={tagsQuery.data}
                                          selected={filterTags}
                                          onChange={setFilterTags}
                                          variant="search"
                                          id="report-tags-filter"
                                      />
                                  }
                                </FormGroup>
                              </Col>
                              <Col md>
                                <FormGroup className="mt-2 mb-2">
                                  <FormLabel>Created before</FormLabel>
                                  <DatePickerField className={'form-control'} name="before"/>
                                </FormGroup>
                              </Col>
                              <Col md>
                                <FormGroup className="mt-2 mb-2">
                                  <FormLabel>Created after</FormLabel>
                                  <DatePickerField className={'form-control'} name="after"/>
                                </FormGroup>
                              </Col>
                            </Row>
                            <Row className={"float-end"}>
                                  <ButtonToolbar>
                                    {(queryState.escalated || queryState.closed || queryState.after ||
                                        queryState.before || queryState.totalReports || queryState.assignedTo ||
                                        queryState.creator || queryState.veracity || hasValues(values)) || filterTags.length > 0 &&
                                        <Button variant={"outline-secondary"} onClick={() => {
                                          clearFilterParams();
                                          values.escalated = "";
                                          values.closed = "";
                                          values.after = "";
                                          values.before = "";
                                          values.totalReports = "";
                                          values.assignedTo = "";
                                          values.creator = "";
                                          values.veracity = "";
                                          setFilterTags([]);
                                        }} className={"me-2"}
                                        >
                                          <FontAwesomeIcon icon={faClose} className={"me-2"}/>
                                          Clear filter(s)
                                        </Button>
                                    }
                                    {hasValues(values) || filterTags.length > 0 &&
                                        <Button variant="primary" type="submit">
                                          Apply filter(s)
                                        </Button>
                                    }
                                  </ButtonToolbar>
                            </Row>
                          </Card.Body>
                        </Card>
                      </Collapse>
                    </Form>
                    )}
              </Formik>
              { groupsQuery.isSuccess && sourcesQuery.isSuccess && tagsQuery.isSuccess && usersQuery.isSuccess &&
                  groupsQuery.data && sourcesQuery.data && tagsQuery.data && usersQuery.data &&
                  <Card>
                    <Card.Header className="pe-2 ps-2">
                      <ButtonToolbar className={"justify-content-between"}>
                        <div>
                          <Button
                              variant="outline-secondary"
                              onClick={() => setShowFilterParams(!showFilterParams)}
                              aria-controls="filterParams"
                              aria-expanded={showFilterParams}
                              size="sm"
                              className="me-2"
                          >
                            <FontAwesomeIcon icon={faFilter} className="me-2"></FontAwesomeIcon>
                            Filter(s)
                          </Button>
                          <GroupModal/>
                        </div>
                        <div>
                          { groupsQuery.data.total && groupsQuery.data.total > 0 &&
                              <AggiePagination size="sm" itemsPerPage={50} total={groupsQuery.data.total} goToPage={goToPage}/>
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
                    <Card.Footer className="pe-2 ps-2">
                      <ButtonToolbar className={"justify-content-end"}>
                        { groupsQuery.data && groupsQuery.data.total && groupsQuery.data.total > 0 &&
                            <AggiePagination size="sm" itemsPerPage={50} total={groupsQuery.data.total} goToPage={goToPage}/>
                        }
                      </ButtonToolbar>
                    </Card.Footer>
                  </Card>
              }
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
              { groupsQuery.isLoading &&
                  <Card>
                    <Card.Header className="pe-2 ps-2">
                      <ButtonToolbar className={"justify-content-between"}>
                        <div>
                          <Button
                              variant="outline-secondary"
                              disabled
                              size="sm"
                              className="me-2"
                          >
                            <FontAwesomeIcon icon={faFilter} className="me-2"></FontAwesomeIcon>
                            Filter(s)
                          </Button>
                          <Button variant="primary" size="sm" disabled>
                            <FontAwesomeIcon icon={faPlusCircle} className={"me-1"}></FontAwesomeIcon>
                            <span> Create group </span>
                          </Button>
                        </div>
                        <div>
                          <LoadingPagination size="sm"/>
                        </div>
                      </ButtonToolbar>
                    </Card.Header>
                    <LoadingGroupTable/>
                  </Card>
              }
              <div className={"pb-5"}></div>
            </Col>
            <Col>
              <div className="d-none d-xl-block">
                {/*<StatsBar/>*/}
              </div>
            </Col>
          </Row>
        </Container>
      </div>
  );
}

export default GroupsIndex;
