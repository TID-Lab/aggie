import React, {useState} from 'react';
import {Button, Card, Col, Container, Form, Row, Collapse, InputGroup, FormControl, Table, ButtonToolbar, Placeholder,
  Pagination,
} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose, faEnvelopeOpen, faPlusCircle, faSearch, faSlidersH} from "@fortawesome/free-solid-svg-icons";
import ReportTable from "../../components/report/ReportTable";
import StatsBar from "../../components/StatsBar";
import {AlertContent} from "../../components/AlertService";
import {Formik} from "formik";
import * as Yup from "yup";
import {useSearchParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {cancelBatch, getBatch, getNewBatch, getReports, setSelectedRead} from "../../api/reports";
import {getSources} from "../../api/sources";
import {getGroups} from "../../api/groups";
import {getTags} from "../../api/tags";
import DatePickerField from "../../components/DatePickerField";
import {CTList, Groups, Reports, ReportSearchState, Source, Tag} from "../../objectTypes";
import {ctListToOptions, hasSearchParams, objectsToIds, parseFilterFields} from "../../helpers";
import {getCTLists} from "../../api/ctlists";
import TagsTypeahead from "../../components/tag/TagsTypeahead";

const ITEMS_PER_PAGE = 50; // This also needs to be set on the backend. Make sure to do so when changing.

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
  // This is whether batch mode is on or not
  const [batchMode, setBatchMode] = useState(searchParams.get("batch") === "true" || false);
  // This is the state of the Report Query
  const [searchState, setSearchState] = useState<ReportSearchState>({
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

  const clearSearchParams = () => { setSearchParams({}); setSearchState({
    keywords: null,
    author: null,
    groupId: null,
    media: null,
    sourceId: null,
    list: null,
    before: null,
    after: null,
    page: null,
  })};

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
  const newBatchMutation = useMutation(getNewBatch, {
    onSuccess: data => {
      batchQuery.refetch();
    }
  });
  const cancelBatchMutation = useMutation(cancelBatch);
  const setSelectedReadMutation = useMutation((reportIds: string[])=>setSelectedRead(reportIds));
  // Querying data
  // This is the batch query, it normally remains disabled until the batch mode is activated.
  const batchQuery = useQuery<Reports | undefined>('reports', () => getBatch(), {
    enabled: batchMode,
    onSuccess: data => {
      if (data && data.total === 0) {
        // If this is true either we have no reports left, or the user has not checked out a batch
        newBatchMutation.mutate();
      }
    }
  });
  const reportsQuery = useQuery<Reports | undefined>(["reports", searchState], () => getReports(searchState), {keepPreviousData: true});
  const sourcesQuery = useQuery<Source[] | undefined>("sources", getSources);
  const ctListsQuery = useQuery<CTList | undefined>("ctLists", getCTLists);
  const groupsQuery = useQuery<Groups | undefined>(["groups", "all"], getGroups);
  const tagsQuery = useQuery("tags", getTags);
  const [showFilterParams, setShowFilterParams] = useState<boolean>(false);
  const [searchTags, setSearchTags] = useState<Tag[] | [] | string[]>();
  return (
      <Container fluid className={"pt-4"}>
        <Row>
          <Col>
          </Col>
          <Col xl={9}>
            { !batchMode &&
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
                        validationSchema={reportQuerySchema}
                        initialValues={{
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
                                        {sourcesQuery.isSuccess && sourcesQuery.data &&
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
                                        <option key={"none"} value={""}>All</option>
                                        {ctListsQuery.isSuccess && ctListsQuery.data &&
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
                                    { hasSearchParams(searchParams) &&
                                        <Button variant={"outline-secondary"} onClick={()=>{
                                          clearSearchParams();
                                          values.keywords = "";
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
            }
            { batchMode &&
                <Card className="mb-4">
                  <Card.Body>
                    <Row className="justify-content-between">
                      <Card.Text as={"h2"} >Batch Mode</Card.Text>
                      <Card.Text>A set of reports has been picked out for you.</Card.Text>
                    </Row>
                  </Card.Body>
                  <Card.Footer>
                    <Button className={"float-end ms-2"} onClick={()=>{
                      if (batchQuery.data && batchQuery.data.results) {
                        setSelectedReadMutation.mutateAsync(objectsToIds(batchQuery.data.results)).then(
                            ()=>{
                              newBatchMutation.mutate();
                            }
                        )
                      }
                    }}>
                      Grab new batch
                    </Button>
                    <Button className={"float-end"} variant={"secondary"} onClick={()=> {
                      cancelBatchMutation.mutate();
                      setBatchMode(false);
                      setSearchParams({
                        batch: "false",
                      });
                    }
                    }>
                      Cancel batch
                    </Button>
                  </Card.Footer>
                </Card>
            }
            { !batchMode && sourcesQuery.isSuccess && reportsQuery.isSuccess && tagsQuery.isSuccess && groupsQuery.isSuccess &&
                tagsQuery.data && reportsQuery.data && groupsQuery.data && sourcesQuery.data &&
                <Card>
                  <ReportTable
                      visibleReports={reportsQuery.data.results}
                      sources={sourcesQuery.data}
                      tags={tagsQuery.data}
                      groups={groupsQuery.data.results}
                      setBatchMode={setBatchMode}
                      batchMode={batchMode}
                      variant={batchMode ? "batch" : "default"}
                  />
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
                                  <Pagination.Last onClick={()=>goToPage(Math.ceil(reportsQuery.data.total/ITEMS_PER_PAGE - 1))}/>
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
            }
            {batchMode && sourcesQuery.isSuccess && batchQuery.isSuccess && tagsQuery.isSuccess && groupsQuery.isSuccess &&
                tagsQuery.data && batchQuery.data && groupsQuery.data && sourcesQuery.data &&
                <Card>
                  <ReportTable
                      visibleReports={batchQuery.data.results}
                      sources={sourcesQuery.data}
                      tags={tagsQuery.data}
                      groups={groupsQuery.data.results}
                      setBatchMode={setBatchMode}
                      batchMode={batchMode}
                      variant={batchMode ? "batch" : "default"}
                  />
                  <Card.Footer></Card.Footer>
                </Card>
            }
            {/* QUERY ERROR STATE: TODO: Put this in the Report Table Component, it makes more sense there. */}
            {((!batchMode && reportsQuery.isError) || (batchMode && batchQuery.isError)) &&
                <Card>
                  <Card.Body>
                    <h1 className={"text-danger"}>
                      { /*@ts-ignore*/}
                      {batchMode ? batchQuery.error.response.status : reportsQuery.error.response.status} Error
                    </h1>
                    <p>Please contact your system administrator with the error code below. </p>
                    { /*@ts-ignore*/}
                    <small>
                      { /*@ts-ignore*/}
                      {batchMode ? batchQuery.error.response.status : reportsQuery.error.response.status}:
                      { /*@ts-ignore*/}
                      {batchMode ? batchQuery.error.response.data : reportsQuery.error.response.data}
                    </small>
                  </Card.Body>
                </Card>
            }
            {/* QUERY LOADING STATE: TODO: Put this in the Report Table Component, it makes more sense there.*/}
            {((!batchMode && reportsQuery.isLoading ) || (batchMode && batchQuery.isLoading)) &&
                <Card>
                  <Card.Header>
                    <ButtonToolbar>
                      <Button variant={"secondary"} disabled aria-disabled={true} className="me-3">
                        <FontAwesomeIcon icon={faEnvelopeOpen} className={"me-2"}/>
                        Read/Unread
                      </Button>
                      <Button variant={"secondary"} disabled aria-disabled={true} className="me-3">
                        <FontAwesomeIcon icon={faPlusCircle} className={"me-2"}/>
                        Add to Group
                      </Button>
                      <Button variant={"primary"} disabled aria-disabled={true} onClick={()=>setBatchMode(true)}>
                        Batch Mode
                      </Button>
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
  );
}
export default ReportsIndex;
