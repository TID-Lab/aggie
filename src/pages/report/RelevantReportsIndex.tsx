import React, {useState} from 'react';
import {Button, Card, Col, Container, Form, Row, Collapse, InputGroup, FormControl, Table, ButtonToolbar, Placeholder,
  Pagination,
} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClose, faEnvelopeOpen, faFilter, faPlusCircle, faSearch, faSlidersH} from "@fortawesome/free-solid-svg-icons";
import ReportTable, {LoadingReportTable} from "../../components/report/ReportTable";
import StatsBar from "../../components/StatsBar";
import {AlertContent} from "../../components/AlertService";
import {Formik} from "formik";
import * as Yup from "yup";
import {useNavigate, useSearchParams} from "react-router-dom";
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
import {AxiosError} from "axios";
import ErrorCard from "../../components/ErrorCard";
import AggiePagination from "../../components/AggiePagination";
const ITEMS_PER_PAGE = 50;
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

const RelevantReportsIndex = (props: IProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // This is the state of the URL
  const [searchParams, setSearchParams] = useSearchParams();

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
    reportsQuery.refetch();
  }

  const reportsQuery = useQuery<Reports | undefined, AxiosError>(["reports", searchState], () => getReports(searchState, [], true), {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
    keepPreviousData: true
  });
  const sourcesQuery = useQuery<Source[] | undefined, AxiosError>("sources", getSources, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });
  const ctListsQuery = useQuery<CTList | undefined, AxiosError>("ctLists", getCTLists, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });
  const groupsQuery = useQuery<Groups | undefined, AxiosError>(["groups", "all"], ()=> {return getGroups();}, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });
  const tagsQuery = useQuery("tags", getTags, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });
  const [showFilterParams, setShowFilterParams] = useState<boolean>(false);
  const [searchTags, setSearchTags] = useState<Tag[] | [] | string[]>();
  return (
      <Container fluid className={"pt-4"}>
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
                    <FontAwesomeIcon icon={faFilter}/>
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
            { sourcesQuery.isSuccess && reportsQuery.isSuccess && tagsQuery.isSuccess && groupsQuery.isSuccess &&
                tagsQuery.data && reportsQuery.data && groupsQuery.data && sourcesQuery.data &&
                <Card>
                  <ReportTable
                      visibleReports={reportsQuery.data.results}
                      sources={sourcesQuery.data}
                      tags={tagsQuery.data}
                      groups={groupsQuery.data.results}
                      variant={"relevant"}
                  />
                  <Card.Footer>
                    <ButtonToolbar className={"justify-content-end"}>
                      { reportsQuery.data.total &&
                          <AggiePagination
                              goToPage={goToPage}
                              total={reportsQuery.data.total}
                              itemsPerPage={ITEMS_PER_PAGE}
                          />
                      }
                    </ButtonToolbar>
                  </Card.Footer>
                </Card>
            }
            {reportsQuery.isError &&
                <>
                  {reportsQuery.error && reportsQuery.error.response && reportsQuery.error.response.status &&
                      reportsQuery.error.response.data &&
                      <ErrorCard
                          errorStatus={reportsQuery.error.response.status}
                          errorData={reportsQuery.error.response.data}/>
                  }
                </>
            }
            {reportsQuery.isLoading &&
                <LoadingReportTable/>
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
export default RelevantReportsIndex;
