import React, {useState} from 'react';
import {
  Button,
  Card,
  Col,
  Container,
  Row,
  FormGroup,
  FormLabel,
  Collapse,
  InputGroup,
  ButtonToolbar,
  ButtonGroup
} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faClose,
  faFilter,
  faSearch,
  faEnvelopeOpen,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";
import ReportTable, {LoadingReportTable} from "../../components/report/ReportTable";
import StatsBar from "../../components/StatsBar";
import {AlertContent} from "../../components/AlertService";
import {Formik, Field, Form} from "formik";
import * as Yup from "yup";
import {useNavigate, useSearchParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {cancelBatch, getBatch, getNewBatch, getReports, setSelectedRead} from "../../api/reports";
import {getSources} from "../../api/sources";
import {getTags} from "../../api/tags";
import DatePickerField from "../../components/DatePickerField";
import {
  CTList,
  ReportQueryState,
  Reports,
  Session,
  Source,
  Tag
} from "../../objectTypes";
import {
  capitalizeFirstLetter,
  ctListToOptions,
  hasSearchParams,
  objectsToIds,
  parseFilterFields,
  reportById,
  tagsById
} from "../../helpers";
import {getCTLists} from "../../api/ctlists";
import TagsTypeahead from "../../components/tag/TagsTypeahead";
import {AxiosError} from "axios";
import ErrorCard from "../../components/ErrorCard";
import AggiePagination, { LoadingPagination } from "../../components/AggiePagination";
import {getSession} from "../../api/session";
import ReportCards from "../../components/report/ReportCards";

const ITEMS_PER_PAGE = 50; // This also needs to be set on the backend. Make sure to do so when changing.

const mediaTypes = ["twitter", "instagram", "RSS", "elmo", "SMS GH", "facebook"];

// TODO: Finish up validating reportQueries using Yup.
const reportQuerySchema = Yup.object().shape({
  sourceId: Yup.array().nullable(),
  media: Yup.string(),
  before: Yup.date(),
  after: Yup.date(),
  page: Yup.number(),
  keywords: Yup.string(),
  groupId: Yup.array().nullable(),
  author: Yup.string()
});

interface IProps {
  setGlobalAlert: (alertMessage: AlertContent) => void,
}

const ReportsIndex = (props: IProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // This is the state of the URL
  const [searchParams, setSearchParams] = useSearchParams();
  // This is whether batch mode is on or not
  const [batchMode, setBatchMode] = useState(searchParams.get("batch") === "true" || false);
  // This is whether card or list view is on
  const [gridView, setGridView] = useState(false);
  const [filterTags, setFilterTags] = useState<Tag[] | []>([]);
  // This is the state of the Report Query
  const [queryState, setQueryState] = useState<ReportQueryState>({
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

  // This clears search state and search params
  const clearFilterParams = () => { setSearchParams({}); setQueryState({
    keywords: queryState.keywords,
    author: queryState.author,
    groupId: queryState.groupId,
    media: null,
    sourceId: null,
    list: null,
    before: null,
    after: null,
    page: null,
  });
  };

  // This clears search state and search params
  const clearSearchParams = () => {
    setSearchParams({});
    setQueryState({
      keywords: null,
      author: null,
      groupId: null,
      media: queryState.media,
      sourceId: queryState.sourceId,
      list: queryState.list,
      before: queryState.before,
      after: queryState.after,
      page: null
    });
  };

  const goToPage = (pageNum: number) => {
    setSearchParams({
      ...searchParams,
      page: String(pageNum)
    });
    setQueryState({
      ...queryState,
      page: pageNum
    });
  }
  const newBatchMutation = useMutation(getNewBatch, {
    onSuccess: data => {batchQuery.refetch();},
    onError: (error: AxiosError) => {
      console.error(error);
    }
  });
  const cancelBatchMutation = useMutation(cancelBatch, {
    onError: (error: AxiosError) => {
      console.error(error);
    }
  });
  const setSelectedReadMutation = useMutation((reportIds: string[])=>setSelectedRead(reportIds));
  // Querying data
  // This is the batch query, it normally remains disabled until the batch mode is activated.

  const batchQuery = useQuery<Reports | undefined, AxiosError>('batch', () => getBatch(), {
    enabled: batchMode,
    onSuccess: data => {
      if (data && data.total === 0) {
        // If this is true either we have no reports left, or the user has not checked out a batch
        newBatchMutation.mutate();
      }
    },
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });
  let sessionFetching = true;
  const sessionQuery = useQuery<Session | undefined, AxiosError>("session", getSession, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        sessionFetching = false;
        navigate('/reports');
      }
    },
    onSuccess: data => {
      sessionFetching = true
      if (location.pathname === "/login") {
        navigate('/reports');
      }
    },
    retry: sessionFetching
  });
  const reportsQuery = useQuery<Reports | undefined, AxiosError>(["reports", {
    queryState: queryState,
    tags: filterTags,
  }], () => getReports(queryState, filterTags), {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
    keepPreviousData: true,
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
  const tagsQuery = useQuery("tags", getTags, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
    onSuccess: (data: Tag[]) => {
      let tagsString = searchParams.get('tags');
      let tagsArray: string[] = [];
      if (tagsString) {
        tagsArray = tagsString.split(",");
        //@ts-ignore
        setFilterTags(tagsById(tagsArray, data));
      }
    }
  });
  const selectedReadStatusMutation = useMutation((read: boolean) => {
    let selectedReportIdsArr = Array.from(selectedReportIds);
    return setSelectedRead(selectedReportIdsArr, read);
  }, {
    onSuccess: (data) => {
      reportsQuery.refetch();
    }
  });
  const [showFilterParams, setShowFilterParams] = useState<boolean>(false);
  const [selectedReportIds, setSelectedReportIds] = useState<Set<string>>(new Set());

  return (
      <Container fluid className={"pt-4"}>
        <Row>
          <Col>
          </Col>
          <Col xl={9}>
            { !batchMode &&
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
                      setSearchParams(parseFilterFields(values, filterTags));
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
                                {errors.groupId}
                                {errors.author}
                                {errors.keywords}
                                <InputGroup className={"mt-2 mb-2"}>
                                  <Field id="keyword" name="keywords" placeholder="Search by keyword, author, or group number" className="form-control"/>
                                  <Button variant="primary" type="submit">
                                    <FontAwesomeIcon icon={faSearch}/>
                                  </Button>
                                </InputGroup>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                        <Collapse in={showFilterParams}>
                          <Card className="mb-3" bg="light">
                            <Card.Body className="pb-2 pt-2">
                              {errors.sourceId}
                              {errors.media}
                              {errors.after}
                              {errors.before}
                              {errors.list}
                              <Row>
                                <Col>
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
                                  <FormGroup controlId="searchMedia" className="mt-2 mb-2">
                                    <FormLabel>Platform</FormLabel>
                                    <Field as={"select"} name="media" className="form-select">
                                      <option key="none" value={""}>All</option>
                                      {mediaTypes.map((mediaType)=> {
                                        return (<option key={mediaType} value={mediaType}>{capitalizeFirstLetter(mediaType)}</option>)
                                      })}
                                    </Field>
                                  </FormGroup>
                                </Col>
                                <Col md>
                                  <FormGroup controlId="searchSource" className="mt-2 mb-2">
                                    <FormLabel>Source</FormLabel>
                                    <Field as={"select"} name="sourceId" className="form-select">
                                      <option key={"none"} value={""}>All</option>
                                      {sourcesQuery.isSuccess && sourcesQuery.data &&
                                        sourcesQuery.data.map((source: Source) => {
                                        return (
                                        <option value={source._id} key={source._id}>
                                      {source.nickname}
                                        </option>
                                        )
                                      })}
                                    </Field>
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row>
                                <Col md>
                                  <FormGroup className="mt-2 mb-2">
                                    <FormLabel>CT List</FormLabel>
                                    <Field as={"select"} name="list" className="form-select">
                                      <option key={"none"} value={""}>All</option>
                                      {ctListsQuery.isSuccess && ctListsQuery.data &&
                                        ctListToOptions(ctListsQuery.data)
                                      }
                                    </Field>
                                  </FormGroup>
                                </Col>
                                <Col md>
                                  <FormGroup className="mt-2 mb-2">
                                    <FormLabel>Authored after</FormLabel>
                                    <DatePickerField className={"form-control"} name="after"/>
                                  </FormGroup>
                                </Col>
                                <Col md>
                                  <FormGroup className="mt-2 mb-2">
                                    <FormLabel>Authored before</FormLabel>
                                    <DatePickerField className={'form-control'} name="before"/>
                                  </FormGroup>
                                </Col>
                              </Row>
                              <Row>
                                <ButtonToolbar className={"justify-content-between"}>
                                  <ButtonGroup className={"mt-2 mb-2"}>
                                    {/*
                                      <Button
                                        variant={"outline-secondary"}
                                        disabled={!gridView}
                                        onClick={()=>setGridView(false)}
                                    >
                                      <FontAwesomeIcon icon={faList} className="me-2"/>
                                      List
                                    </Button>
                                    <Button variant={"outline-secondary"} disabled={gridView} onClick={()=>setGridView(true)}>
                                      <FontAwesomeIcon icon={faGrip} className="me-2"/>
                                      Grid
                                    </Button>
                                    */}
                                  </ButtonGroup>
                                  {(values.sourceId || values.media || values.after || values.before || values.list || filterTags.length > 0) &&
                                      <div className={"mt-2 mb-2"}>
                                        <Button variant={"outline-secondary"} onClick={() => {
                                          clearFilterParams();
                                          values.media = "";
                                          values.sourceId = "";
                                          values.list = "";
                                          values.before = "";
                                          values.after = "";
                                          setFilterTags([]);
                                        }} className={"me-2"}
                                        >
                                          <FontAwesomeIcon icon={faClose} className={"me-2"}/>
                                          Clear filter(s)
                                        </Button>
                                        <Button variant="primary" type="submit">
                                          Apply filter(s)
                                        </Button>
                                      </div>
                                  }
                                </ButtonToolbar>
                              </Row>
                            </Card.Body>
                          </Card>
                        </Collapse>
                      </Form>
                    )}
            </Formik>
            }
            { batchMode &&
                <Card className="mb-4">
                  <Card.Body>
                    <Row className="justify-content-between">
                      <Card.Text as={"h2"} >Batch Mode</Card.Text>
                      {sessionQuery.isSuccess && sessionQuery.data &&
                          <Card.Text>Hello, <strong>{sessionQuery.data.username}</strong>.
                            A set of reports has been picked out for
                            you.</Card.Text>
                      }
                    </Row>
                  </Card.Body>
                  <Card.Footer className="pe-2">
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
            { !batchMode && sourcesQuery.isSuccess && reportsQuery.isSuccess && tagsQuery.isSuccess &&
                tagsQuery.data && reportsQuery.data && sourcesQuery.data &&
                <>
                  <Card>
                    <Card.Header className="pe-2 ps-2">
                      <ButtonToolbar className={"justify-content-between"}>
                        <div>
                          <Button
                              variant="outline-secondary"
                              onClick={() => setShowFilterParams(!showFilterParams)}
                              aria-controls="searchParams"
                              aria-expanded={showFilterParams}
                              className={"me-2"}
                              size="sm"
                          >
                            <FontAwesomeIcon icon={faFilter} className="me-2" />
                            Filter(s)
                          </Button>
                          <Button variant={"primary"} className={"me-2"} size="sm" onClick={()=>{
                            if (setBatchMode) {
                              setSearchParams(
                                  {
                                    ...searchParams,
                                    batch: "true"
                                  }
                              )
                              setBatchMode(true);
                            }
                          }}>
                            Batch mode
                          </Button>
                          <ButtonGroup className="me-2">
                            <Button disabled={selectedReportIds.size === 0} size="sm" variant={"secondary"}
                                    onClick={()=>selectedReadStatusMutation.mutate(true)}
                            >
                              <FontAwesomeIcon icon={faEnvelopeOpen}></FontAwesomeIcon>
                            </Button>
                            <Button disabled={selectedReportIds.size === 0} size="sm" variant={"secondary"}
                                    onClick={()=>selectedReadStatusMutation.mutate(false)}
                            >
                              <FontAwesomeIcon icon={faEnvelope}></FontAwesomeIcon>
                            </Button>
                          </ButtonGroup>
                        </div>
                        { reportsQuery.data.total !== null &&
                            <AggiePagination
                                goToPage={goToPage}
                                total={reportsQuery.data.total}
                                itemsPerPage={ITEMS_PER_PAGE}
                                size="sm"
                            />
                        }
                      </ButtonToolbar>
                    </Card.Header>
                    {!gridView &&
                        <ReportTable
                            visibleReports={reportsQuery.data.results}
                            sources={sourcesQuery.data}
                            tags={tagsQuery.data}
                            setSelectedReportIds={setSelectedReportIds}
                            selectedReportIds={selectedReportIds}
                            variant={"default"}
                        />
                    }
                    <Card.Footer className="pe-2 ps-2">
                      { reportsQuery.data.total !== null &&
                          <AggiePagination
                              goToPage={goToPage}
                              total={reportsQuery.data.total}
                              itemsPerPage={ITEMS_PER_PAGE}
                              size="sm"
                          />
                      }
                    </Card.Footer>
                  </Card>
                  {gridView &&
                      <ReportCards
                          sources={sourcesQuery.data}
                          visibleReports={reportsQuery.data.results}
                          tags={tagsQuery.data}
                          variant={"default"}
                      ></ReportCards>
                  }
                </>
            }
            {batchMode && sourcesQuery.isSuccess && batchQuery.isSuccess && tagsQuery.isSuccess &&
                tagsQuery.data && batchQuery.data && sourcesQuery.data &&
                <Card>
                  <Card.Header className="ps-2">
                    <ButtonToolbar className={"justify-content-start"}>
                      <ButtonGroup className="me-2">
                        <Button disabled={selectedReportIds.size === 0} size="sm" variant={"secondary"}
                                onClick={()=>selectedReadStatusMutation.mutate(true)}
                        >
                          <FontAwesomeIcon icon={faEnvelopeOpen}></FontAwesomeIcon>
                        </Button>
                        <Button disabled={selectedReportIds.size === 0} size="sm" variant={"secondary"}
                                onClick={()=>selectedReadStatusMutation.mutate(false)}
                        >
                          <FontAwesomeIcon icon={faEnvelope}></FontAwesomeIcon>
                        </Button>
                      </ButtonGroup>
                    </ButtonToolbar>
                  </Card.Header>
                  {!gridView &&
                      <ReportTable
                          visibleReports={batchQuery.data.results}
                          sources={sourcesQuery.data}
                          tags={tagsQuery.data}
                          selectedReportIds={selectedReportIds}
                          setSelectedReportIds={setSelectedReportIds}
                          variant={"batch"}
                      />
                  }
                  <Card.Footer className="pe-2 ps-2">
                    <ButtonToolbar className="justify-content-end">
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
                    </ButtonToolbar>
                  </Card.Footer>
                </Card>
            }
            {((!batchMode && reportsQuery.isError) || (batchMode && batchQuery.isError)) &&
                <>
                  {batchMode && batchQuery.error && batchQuery.error.response && batchQuery.error.response.status &&
                      batchQuery.error.response.data &&
                      <ErrorCard
                          errorStatus={batchQuery.error.response.status}
                          errorData={batchQuery.error.response.data}/>
                  }
                  {!batchMode && reportsQuery.error && reportsQuery.error.response && reportsQuery.error.response.status &&
                      reportsQuery.error.response.data &&
                      <ErrorCard
                          errorStatus={reportsQuery.error.response.status}
                          errorData={reportsQuery.error.response.data}/>
                  }
                </>
            }
            {((!batchMode && reportsQuery.isLoading) || (batchMode && batchQuery.isLoading)) &&
                <Card>
                  <Card.Header className="pe-2 ps-2">
                    <ButtonToolbar className={"justify-content-between"}>
                      <div>
                        <Button
                            variant="outline-secondary"
                            className={"me-2"}
                            size="sm"
                            disabled
                        >
                          <FontAwesomeIcon icon={faFilter} className="me-2" />
                          Filter(s)
                        </Button>
                        <Button variant={"primary"} className={"me-2"} size="sm" disabled>
                          Batch mode
                        </Button>
                        <ButtonGroup className="me-2">
                          <Button disabled size="sm" variant={"secondary"}>
                            <FontAwesomeIcon icon={faEnvelopeOpen}></FontAwesomeIcon>
                          </Button>
                          <Button disabled size="sm" variant={"secondary"}>
                            <FontAwesomeIcon icon={faEnvelope}></FontAwesomeIcon>
                          </Button>
                        </ButtonGroup>
                      </div>
                      <LoadingPagination size="sm"/>
                    </ButtonToolbar>
                  </Card.Header>
                  <LoadingReportTable variant="default"/>
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
  );
}
export default ReportsIndex;
