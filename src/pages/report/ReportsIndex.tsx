import React, {useState} from 'react';
import {
  Button,
  Card,
  Col,
  Container,
  Form,
  Row,
  Collapse,
  InputGroup,
  FormControl,
  Table,
  ButtonToolbar,
  Image,
  Placeholder, PlaceholderButton,
} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEnvelopeOpen, faPlusCircle, faSearch, faSlidersH} from "@fortawesome/free-solid-svg-icons";
import ReportTable from "../../components/report/ReportTable";
import StatsBar from "../../components/StatsBar";
import {AlertContent} from "../../components/AlertService";
import { Formik } from "formik";
import * as Yup from "yup";
import {Link, useLocation, useSearchParams} from "react-router-dom";
import {useQuery, useQueryClient} from "react-query";
import {getReports} from "../../api/reports";
import {getSources} from "../../api/sources";
import {getGroups} from "../../api/groups";
import {getTags} from "../../api/tags";
import DatePickerField from "../../components/DatePickerField";
import {CTList, Groups, Reports, Source, Tag} from "../../objectTypes";
import {
  ctListToOptions, parseFilterFields,
} from "../../helpers";
import {getCTLists} from "../../api/ctlists";
import AggiePagination from "../../components/AggiePagination";
import TagsTypeahead from "../../components/tag/TagsTypeahead";

const reportQuerySchema = Yup.object().shape({
  keywords: Yup.string(),
  tags: Yup.array(),
  sourceId: Yup.array(),
  groupId: Yup.array(),
  media: Yup.string(),
  author: Yup.string(),
  before: Yup.date(),
  after: Yup.date(),
  page: Yup.number(),
});

interface IProps {
  setGlobalAlert: (alertMessage: AlertContent) => void,
}

const ReportsIndex = (props: IProps) => {
  // This is a react-router hook
  const [filterParams, setFilterParams] = useSearchParams();
  // Querying data
  // This is a react-query hook
  const reportsQuery = useQuery<Reports | undefined>(["reports", filterParams], () => getReports(filterParams));
  const sourcesQuery = useQuery<Source[] | undefined>("sources", getSources);
  const ctListsQuery = useQuery<CTList | undefined>("ctLists", getCTLists);
  const groupsQuery = useQuery<Groups | undefined>(["groups", "all"], getGroups);
  const tagsQuery = useQuery("tags", getTags, {
    onSuccess: (data: Tag[]) => {

    }
  });
  const [showFilterParams, setShowFilterParams] = useState<boolean>(false);
  const [queryTags, setQueryTags] = useState<Tag[] | [] | string[]>([]);
  return (
      <div className="mt-2">
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col xl={9}>
              <Card className="mb-4">
                <Card.Body>
                  <InputGroup>
                    <FormControl
                        placeholder="Search reports"
                        aria-label="Search reports"
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
                  <Formik
                      initialValues={{
                        tags: filterParams.get("tags") || [],
                        keywords: filterParams.get("keywords") || "",
                        author: filterParams.get("author") || "",
                        groupId: filterParams.get("groupId") || "",
                        media: filterParams.get("media") || "",
                        sourceId: filterParams.get("sourceId") || "",
                        list: filterParams.get("ctlist") || "",
                      }}
                      onSubmit={(values, {setSubmitting, resetForm}) => {
                        setFilterParams(parseFilterFields(values));
                      }}
                  >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleSubmit,
                        setFieldValue,
                        isSubmitting,
                        /* and other goodies */
                      }) => (
                        <Form noValidate onSubmit={handleSubmit}>
                          <Collapse in={showFilterParams}>
                            <div id="filterParams">
                              <Row className="mb-3 mt-3">
                                <Col md>
                                  <Form.Group controlId="searchKeyword">
                                    <Form.Label>Keyword</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Search by keywords"
                                        name="keywords"
                                        onChange={handleChange}
                                        value={values.keywords}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md>
                                  <Form.Group controlId="searchTag">
                                    <Form.Label>Tag</Form.Label>
                                    { tagsQuery.isFetched &&
                                    <TagsTypeahead
                                        options={tagsQuery.data}
                                        selected={queryTags}
                                        onChange={setQueryTags}
                                        variant={"search"}
                                    />
                                    }
                                  </Form.Group>
                                </Col>
                                <Col md>
                                  <Form.Group controlId="searchAuthor">
                                    <Form.Label>Author</Form.Label>
                                    <Form.Control
                                        placeholder="Search by author"
                                        name="author"
                                        onChange={handleChange}
                                        value={values.author}
                                    />
                                  </Form.Group>
                                </Col>
                                <Col md>
                                  <Form.Group controlId="searchAuthor">
                                    <Form.Label>Group #</Form.Label>
                                    <Form.Control
                                        placeholder="Search by group #"
                                        name="groupId"
                                        onChange={handleChange}
                                        value={values.groupId}
                                    />
                                  </Form.Group>
                                </Col>
                              </Row>
                              <Row className="mb-3">
                                <Col md>
                                  <Form.Group controlId="searchPlatform">
                                    <Form.Label>Platform</Form.Label>
                                    <Form.Select
                                        name="media"
                                        onChange={handleChange}
                                        value={values.media}
                                    >
                                      <option>All</option>

                                    </Form.Select>
                                  </Form.Group>
                                </Col>
                                <Col md>
                                  <Form.Group controlId="searchPlatform">
                                    <Form.Label>Source</Form.Label>
                                    <Form.Select
                                        name="sourceId"
                                        onChange={handleChange}
                                        value={values.sourceId}
                                    >
                                      <option value={""}>All</option>
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
                                  <Form.Group controlId="search">
                                    <Form.Label>CT List</Form.Label>
                                    <Form.Select
                                        name="list"
                                        onChange={handleChange}
                                        value={values.list}
                                    >
                                      <option value={""}>All</option>
                                      {ctListsQuery.isFetched && ctListsQuery.data &&
                                      ctListToOptions(ctListsQuery.data)
                                      }
                                    </Form.Select>
                                  </Form.Group>
                                </Col>
                                <Col md>
                                  <Form.Group>
                                    <Form.Label>Authored after</Form.Label>
                                    <DatePickerField className={"form-control"} name="after"/>
                                  </Form.Group>
                                </Col>
                                <Col md>
                                  <Form.Group>
                                    <Form.Label>Authored before</Form.Label>
                                    <DatePickerField className={'form-control'} name="before"/>
                                  </Form.Group>
                                </Col>
                              </Row>
                              <Row className={"float-end"}>
                                <Form.Group>
                                <Button variant="primary" type="submit"><FontAwesomeIcon icon={faSearch}/> Search </Button>
                                </Form.Group>
                              </Row>
                            </div>
                          </Collapse>
                        </Form>
                    )}
                  </Formik>
                </Card.Body>
              </Card>
              {sourcesQuery.isFetched && reportsQuery.isFetched && tagsQuery.isFetched && groupsQuery.isFetched &&
                  tagsQuery.data && reportsQuery.data && groupsQuery.data && sourcesQuery.data &&
              <ReportTable
                  visibleReports={reportsQuery.data.results}
                  sources={sourcesQuery.data}
                  tags={tagsQuery.data}
                  groups={groupsQuery.data.results}
                  variant="default"
              />
              }
              {/* QUERY ERROR STATE: TODO: Put this in the Report Table Component, it makes more sense there. */}
              {reportsQuery.isError &&
                  <Card>
                    <Card.Body>
                      { /*@ts-ignore*/}
                      <h1 className={"text-danger"}>{reportsQuery.error.response.status} Error</h1>
                      <p>Please contact your system administrator with the error code below. </p>
                      { /*@ts-ignore*/}
                      <small>{reportsQuery.error.response.status}: {reportsQuery.error.response.data}</small>
                    </Card.Body>
                  </Card>
              }
              {/* QUERY LOADING STATE: TODO: Put this in the Report Table Component, it makes more sense there.*/}
              {reportsQuery.isLoading &&
                  <Card>
                    <Card.Header>
                      <ButtonToolbar>
                        <Button variant={"secondary"} className="me-3">
                          <FontAwesomeIcon icon={faEnvelopeOpen} className={"me-2"}/>
                          Read/Unread
                        </Button>
                        <Button variant={"secondary"} className="me-3">
                          <FontAwesomeIcon icon={faPlusCircle} className={"me-2"}/>
                          Add to Group
                        </Button>
                        <Link to={'/batch'}>
                          <Button variant={"primary"}>
                            Batch Mode
                          </Button>
                        </Link>
                      </ButtonToolbar>
                    </Card.Header>
                    <Table bordered hover size="sm">
                      <thead>
                        <tr>
                          <th><Form><Form.Check type="checkbox" id={"select-all"} disabled/></Form></th>
                          <th>Source Info</th>
                          <th>Thumbnail</th>
                          <th>Content</th>
                          <th>Tags</th>
                          <th>Group</th>
                        </tr>
                      </thead>
                      <tbody>
                      <tr>
                        <td><Form><Form.Check type="checkbox" disabled/></Form></td>
                        <td className="sourceInfo">
                          <Placeholder as={Card.Text} animation="glow">
                            <Placeholder xs={4} />
                            <br/>
                            <Placeholder xs={5} />
                            <br/>
                            <Placeholder xs={4} />
                          </Placeholder>
                          <br/>
                          <Placeholder as={Card.Text} animation="glow">
                            <Placeholder xs={4}/>
                            <br/>
                            <Placeholder xs={5}/>
                            <br/>
                            <Placeholder xs={4}/>
                          </Placeholder>
                        </td>
                        <td>

                        </td>
                        <td>
                          <Placeholder as={Card.Text} animation="glow">
                            <Placeholder xs={12} />
                            <Placeholder xs={12} />
                            <Placeholder style={{ minWidth: 400 }}/>
                            {/* Not sure why this minWidth thing makes it like 3/4 of the screen */}
                          </Placeholder>
                        </td>
                        <Form.Group>
                          <Form.Control
                              as="textarea"
                              style={{ height: '144px' }}
                              disabled
                          />
                        </Form.Group>
                        <td className={"align-middle"}>
                          <Placeholder animation="glow">
                            <Placeholder.Button variant="link" xs={12}/>
                          </Placeholder>
                        </td>
                      </tr>
                      </tbody>
                    </Table>
                  </Card>
              }
              {reportsQuery.data && reportsQuery.data.total &&
              <AggiePagination
                  variant="reports"
                  currentPage={Number(filterParams.get("page")) || 0}
                  total={reportsQuery.data.total}
                  itemsPerPage={25}
              />
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
export default ReportsIndex;
