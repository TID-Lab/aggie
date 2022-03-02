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
  Placeholder, PlaceholderButton, Pagination,
} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose, faEnvelopeOpen, faPlusCircle, faSearch, faSlidersH} from "@fortawesome/free-solid-svg-icons";
import ReportTable from "../../components/report/ReportTable";
import StatsBar from "../../components/StatsBar";
import {AlertContent} from "../../components/AlertService";
import {Formik, FormikValues, useFormik} from "formik";
import * as Yup from "yup";
import {Link, useLocation, useSearchParams} from "react-router-dom";
import {useQuery, useQueryClient} from "react-query";
import {getReports} from "../../api/reports";
import {getSources} from "../../api/sources";
import {getGroups} from "../../api/groups";
import {getTags} from "../../api/tags";
import DatePickerField from "../../components/DatePickerField";
import {CTList, Groups, Reports, ReportSearchState, Source, Tag} from "../../objectTypes";
import {
  ctListToOptions, parseFilterFields, searchParamsToObj,
} from "../../helpers";
import {getCTLists} from "../../api/ctlists";
import TagsTypeahead from "../../components/tag/TagsTypeahead";

const ITEMS_PER_PAGE = 25; // This also needs to be set on the backend. Make sure to do so when changing.
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
  const queryClient = useQueryClient();
  // This is the state of the URL
  const [searchParams, setSearchParams] = useSearchParams();
  // This is the state of the Report Query
  const [searchState, setSearchState] = useState<ReportSearchState>({
    tags: null,
    keywords: searchParams.get("keywords"),
    author: searchParams.get("author"),
    groupId: searchParams.get("groupId"),
    media: searchParams.get("media"),
    sourceId: searchParams.get("sourceId"),
    list: searchParams.get("list"),
    before: searchParams.get("before"),
    after: searchParams.get("after"),
    page: Number(searchParams.get("page") || "0")
  });

  const clearFilterParams = () => { setSearchParams({}); setSearchState({
    tags: null,
    keywords: null,
    author: null,
    groupId: null,
    media: null,
    sourceId: null,
    list: null,
    before: null,
    after: null,
    page: null
  }) }
  const goToPage = (pageNum: number) => {
    setSearchParams({
      ...searchParams,
      page: String(pageNum)
    });
    setSearchState({
      ...searchState,
      page: pageNum
    });
  }
  const hasSearchParams = () => {
    // TODO: Is there a better way of finding the length of searchParams?
    let counter = 0;
    for (const [index, element] of searchParams.entries()) { counter++; }
    if (searchParams.has("page") && counter == 1) return false;
    else if (searchParams.toString() !== "") return true;
    else return false;
  }

  // Querying data
  // This is a react-query hook
  const reportsQuery = useQuery<Reports | undefined>(["reports", searchState], () => getReports(searchState), {keepPreviousData: true});
  const sourcesQuery = useQuery<Source[] | undefined>("sources", getSources);
  const ctListsQuery = useQuery<CTList | undefined>("ctLists", getCTLists);
  const groupsQuery = useQuery<Groups | undefined>(["groups", "all"], getGroups);
  const tagsQuery = useQuery("tags", getTags, {
    onSuccess: (data: Tag[]) => {
    }
  });
  const [showFilterParams, setShowFilterParams] = useState<boolean>(false);
  const [searchTags, setSearchTags] = useState<Tag[] | [] | string[]>([]);
  return (
      <div className="mt-4">
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
                        aria-controls="searchParams"
                        aria-expanded={showFilterParams}
                    >
                      <FontAwesomeIcon icon={faSlidersH}/>
                    </Button>
                  </InputGroup>
                  <Formik
                      initialValues={{
                        tags: searchParams.get("tags") || [],
                        keywords: searchParams.get("keywords") || "",
                        author: searchParams.get("author") || "",
                        groupId: searchParams.get("groupId") || "",
                        media: searchParams.get("media") || "",
                        sourceId: searchParams.get("sourceId") || "",
                        list: searchParams.get("list") || "",
                        before: searchParams.get("before") || "",
                        after: searchParams.get("after") || "",
                      }}
                      onSubmit={(values, {setSubmitting, resetForm}) => {
                        setSearchParams(parseFilterFields(values));
                        setSearchState(parseFilterFields(values));
                      }}
                  >
                    {({
                        values,
                        errors,
                        touched,
                        handleChange,
                        handleSubmit,
                        setFieldValue,
                        resetForm,
                        isSubmitting,
                        /* and other goodies */
                      }) => (
                        <Form noValidate onSubmit={handleSubmit}>
                          <Collapse in={showFilterParams}>
                            <div id="searchParams">
                              <Row>
                                <Col md>
                                  <Form.Group controlId="searchKeyword" className={"mt-2 mb-2"}>
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
                                  <Form.Group controlId="searchTag" className={"mt-2 mb-2"}>
                                    <Form.Label>Tag</Form.Label>
                                    { tagsQuery.isFetched &&
                                    <TagsTypeahead
                                        options={tagsQuery.data}
                                        selected={searchTags}
                                        onChange={setSearchTags}
                                        variant={"search"}
                                    />
                                    }
                                  </Form.Group>
                                </Col>
                                <Col md>
                                  <Form.Group controlId="searchAuthor" className={"mt-2 mb-2"}>
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
                                  <Form.Group controlId="searchGroupId" className={"mt-2 mb-2"}>
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
                                  <Form.Group controlId="searchPlatform" className={"mt-2 mb-2"}>
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
                                  <Form.Group controlId="searchSource" className={"mt-2 mb-2"}>
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
                                  <Form.Group controlId="searchCTList" className={"mt-2 mb-2"}>
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
                                  <Form.Group controlId="searchAfter" className={"mt-2 mb-2"}>
                                    <Form.Label>Authored after</Form.Label>
                                    <DatePickerField className={"form-control"} name="after"/>
                                  </Form.Group>
                                </Col>
                                <Col md>
                                  <Form.Group controlId="searchBefore" className={"mt-2 mb-2"}>
                                    <Form.Label>Authored before</Form.Label>
                                    <DatePickerField className={'form-control'} name="before"/>
                                  </Form.Group>
                                </Col>
                              </Row>
                              <Row className={"float-end"}>
                                <ButtonToolbar>
                                  { hasSearchParams() &&
                                      <Button variant={"outline-secondary"} onClick={()=>{
                                        clearFilterParams();
                                        values.keywords = "";
                                        values.tags = [];
                                        values.groupId = "";
                                        values.media = "";
                                        values.author = "";
                                        values.sourceId = "";
                                        values.list = "";
                                        values.before = "";
                                        values.after = "";
                                      }} className={"me-3"}>
                                        <FontAwesomeIcon icon={faClose} className={"me-2"}/>
                                        Clear Filter
                                      </Button>
                                  }
                                  <Button variant="primary" type="submit">
                                    <FontAwesomeIcon icon={faSearch} className={"me-2"}/>
                                    Search
                                  </Button>
                                </ButtonToolbar>
                              </Row>
                            </div>
                          </Collapse>
                        </Form>
                    )}
                  </Formik>
                </Card.Body>
              </Card>
              <Card>

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
                <Card.Footer>
                  <ButtonToolbar className={"justify-content-center"}>
                    { reportsQuery.data && reportsQuery.data.total &&
                        <Pagination className={"mb-0"}>
                          {Number(searchParams.get('page')) === 0 &&
                              <>
                                <Pagination.First disabled/>
                                <Pagination.Prev disabled aria-disabled="true"/>
                              </>
                          }
                          {Number(searchParams.get('page')) > 0 &&
                              <>
                                <Pagination.First onClick={()=>goToPage(0)}/>
                                <Pagination.Prev onClick={()=>goToPage(Number(searchParams.get('page')) - 1)}/>
                                <Pagination.Item onClick={()=>goToPage(Number(searchParams.get('page')) - 1)}>
                                  {Number(searchParams.get('page')) - 1}
                                </Pagination.Item>
                              </>
                          }
                          <Pagination.Item disabled aria-disabled="true">{Number(searchParams.get('page'))}</Pagination.Item>
                          {Number(searchParams.get('page')) + 1 < (reportsQuery.data.total/ITEMS_PER_PAGE) &&
                              <>
                                <Pagination.Item onClick={()=>goToPage(Number(searchParams.get('page')) + 1)}>
                                  {Number(searchParams.get('page')) + 1}
                                </Pagination.Item>
                                <Pagination.Next onClick={()=>goToPage(Number(searchParams.get('page')) + 1)}/>
                                {/*@ts-ignore*/}
                                <Pagination.Last onClick={()=>goToPage(reportsQuery.data.total/ITEMS_PER_PAGE - 1)}/>
                              </>
                          }
                          {Number(searchParams.get('page')) + 1 >= (reportsQuery.data.total/ITEMS_PER_PAGE) &&
                              <>
                                <Pagination.Next disabled/>
                                <Pagination.Last disabled/>
                              </>
                          }
                        </Pagination>
                    }
                  </ButtonToolbar>
                </Card.Footer>
              </Card>
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
                        <td>
                          <Form.Group>
                            <Form.Control
                                as="textarea"
                                style={{ height: '144px' }}
                                disabled
                            />
                          </Form.Group>
                        </td>
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
export default ReportsIndex;
