import React, {ChangeEvent, Component, useEffect, useState} from 'react';
import  {AxiosError} from 'axios';
import {Container, Col, Row, Card, Table, Form, ButtonToolbar, Button, Alert} from "react-bootstrap";
import StatsBar from '../../components/StatsBar';
import { Tweet } from "react-twitter-widgets";
import {
  tagsById,
  sourcesById,
  reportAuthorUrl,
  stringToDate,
  facebookUrlToEmbedUrl,
  tagById,
  groupById, sourcesNamesById, aggieVeracityOptions
} from "../../helpers";
import {
  faCopy,
  faFlag,
  faEnvelope,
  faEnvelopeOpen,
  faCheckCircle,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {
  getReport,
  setSelectedEscalated,
  setSelectedNotes,
  setSelectedRead, setSelectedTags,
  setSelectedVeracity
} from "../../api/reports";
import {getSources} from "../../api/sources";
import {getGroup, getGroups} from "../../api/groups";
import {getTags} from "../../api/tags";
import "./ReportDetails.css";
// @ts-ignore
import { FacebookProvider, Like } from 'react-facebook';
import {Group, Groups, hasId, Report, Source, Tag, Veracity} from "../../objectTypes";
import TagsTypeahead from "../../components/tag/TagsTypeahead";
import ErrorCard from "../../components/ErrorCard";
import {faCircle} from "@fortawesome/free-regular-svg-icons";
import VeracityIndication from "../../components/VeracityIndication";
import EscalatedIndication from "../../components/EscalatedIndication";

interface ReadUpdateInfo {
  reportId: string,
  read: boolean
}
interface VeracityUpdateInfo {
  reportId: string,
  veracity: Veracity | string,
}
interface NotesUpdateInfo {
  reportId: string,
  notes: string
}
interface EscalatedUpdateInfo {
  reportId: string,
  escalated: boolean
}
interface TagsUpdateInfo {
  reportId: string,
  tags: hasId[]
}

const ReportDetails = () => {
  let { id } = useParams<{id: string}>();
  const queryClient = useQueryClient();
  const [escalated, setEscalated] = useState<boolean>(false);
  const [veracity, setVeracity] = useState<Veracity | string>("Unconfirmed");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<Tag[] | []>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState({header: "", body: ""});
  const [group, setGroup] = useState<Group | null>(null);
  const handleEscalatedChange = (event: React.ChangeEvent<HTMLInputElement>) => setEscalated(event.target.checked);
  const handleVeracityChange = (event: React.ChangeEvent<HTMLSelectElement>) => setVeracity(event.target.value);
  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => setNotes(event.target.value);
  const readStatusMutation = useMutation((readUpdateInfo: ReadUpdateInfo) => {
    return setSelectedRead([readUpdateInfo.reportId], readUpdateInfo.read);
  }, {
    onSuccess: data => {
      // TODO: Instead of refetching, just use a React useState to adjust the UI on Success
      reportQuery.refetch();
    },
    onError: (error: AxiosError) => {
      if (error && error.response && error.response.status && error.response.data) {
        setShowAlert(false);
        setAlertMessage({
          header: "Failed to update read status (" + error.response.status + ")",
          body: error.response.data,
        });
        setShowAlert(true);
      } else {
        console.error("Uncaught read change error.")
      }
    }
  });

  const escalatedStatusMutation = useMutation((escalatedUpdateInfo: EscalatedUpdateInfo) => {
    return setSelectedEscalated([escalatedUpdateInfo.reportId], escalatedUpdateInfo.escalated);
  }, {
    onSuccess: data => {
      // TODO: Instead of refetching, just use a React useState to adjust the UI on Success
      reportQuery.refetch();
    },
    onError: (error: AxiosError) => {
      if (error && error.response && error.response.status && error.response.data) {
        setShowAlert(false);
        setAlertMessage({
          header: "Failed to update escalated status " + error.response.status,
          body: error.response.data,
        });
        setShowAlert(true);
      } else {
        console.error("Uncaught escalation update error.")
      }
    }
  });
  const veracityStatusMutation = useMutation((veracityUpdateInfo: VeracityUpdateInfo) => {
    return setSelectedVeracity([veracityUpdateInfo.reportId], veracityUpdateInfo.veracity);
  }, {
    onSuccess: data => {
      // TODO: Instead of refetching, just use a React useState to adjust the UI on Success
      reportQuery.refetch();
    },
    onError: (error: AxiosError) => {
      if (error && error.response && error.response.status && error.response.data) {
        setShowAlert(false);
        setAlertMessage({
          header: "Failed to update veracity status (" + error.response.status + ")",
          body: error.response.data,
        });
        setShowAlert(true);
      } else {
        console.error("Uncaught veracity update error.")
      }
    }
  });
  const notesUpdateMutation = useMutation((notesUpdateInfo: NotesUpdateInfo) => {
    return setSelectedNotes([notesUpdateInfo.reportId], notesUpdateInfo.notes);
  }, {
    onSuccess: data => {
      // TODO: Instead of refetching, just use a React useState to adjust the UI on Success
      reportQuery.refetch();
    },
    onError: (error: AxiosError) => {
      if (error && error.response && error.response.status && error.response.data) {
        setShowAlert(false);
        setAlertMessage({
          header: "Failed to update notes (" + error.response.status + ")",
          body: error.response.data,
        });
        setShowAlert(true);
      } else {
        console.error("Uncaught note update error.")
      }
    }
  });
  const tagsUpdateMutation = useMutation((tagsUpdateInfo: TagsUpdateInfo) => {
    return setSelectedTags([tagsUpdateInfo.reportId], tagsUpdateInfo.tags);
  }, {
    onSuccess: data => {
      // TODO: Instead of refetching, just use a React useState to adjust the UI on Success
      reportQuery.refetch();
    },
    onError: (error: AxiosError) => {
      if (error && error.response && error.response.status && error.response.data) {
        setShowAlert(false);
        setAlertMessage({
          header: "Failed to update tags (" + error.response.status + ")",
          body: error.response.data,
        });
        setShowAlert(true);
      } else {
        console.error("Uncaught tags update error.")
      }
    }
  });
  const tagsQuery = useQuery<Tag[] | undefined, AxiosError>("tags", getTags);
  const reportQuery = useQuery<Report | undefined, AxiosError>(["report", id], () => getReport(id), {
    onSuccess: data => {
      if (data) {
        setVeracity(data.veracity);
        setNotes(data.notes);
        setEscalated(data.escalated);
        //@ts-ignore TODO: WHYYYYY??? Typescript function return values need to be set.
        setTags(tagsById(data.smtcTags, tagsQuery.data));
      }
    }
  });
  const sourcesQuery = useQuery<Source[] | undefined, AxiosError>("sources", getSources);
  const reportGroupQuery = useQuery<Group | undefined, AxiosError>(["group", reportQuery.data?._group], ()=> getGroup(reportQuery.data?._group), {
    enabled: (reportQuery.isSuccess && reportQuery.data && reportQuery.data._group != ""),
  })
  const groupsQuery = useQuery<Groups | undefined, AxiosError>("groups", ()=>{return getGroups()});

  return (
      <div className={"mt-4"}>
        <Container fluid>
          <Row>
            <Col></Col>
            <Col xl={9}>
              {reportQuery.isSuccess && tagsQuery.isSuccess && sourcesQuery.isSuccess && groupsQuery.isSuccess &&
                  reportQuery.data && tagsQuery.data && sourcesQuery.data && groupsQuery.data &&
                  <>
                    <h3 className={"mb-4"}>
                      <span className={"me-2"}>Report details</span>
                    </h3>
                    <Card>
                      <Card.Header>
                        <ButtonToolbar className="justify-content-end">
                          <Button variant={reportQuery.data.read ? "outline-primary" : "primary"} onClick={() => {
                            readStatusMutation.mutate({
                              reportId: reportQuery.data?._id || "",
                              read: reportQuery.data?.read ? false : true,
                            })
                          }}>
                            {reportQuery.data.read ?
                                <FontAwesomeIcon icon={faEnvelope} className={"me-2"}/> :
                                <FontAwesomeIcon icon={faEnvelopeOpen} className={"me-2"}/>}
                            {reportQuery.data.read ?
                                "Mark unread" :
                                "Mark read"}
                          </Button>
                        </ButtonToolbar>
                      </Card.Header>
                      <Card.Body className={reportQuery.data.read ? "bg-light" : "bg-white"}>
                        <Row>
                          <Col>
                            <Alert variant="danger" onClose={() => setShowAlert(false)} show={showAlert} dismissible>
                              <Alert.Heading>{alertMessage.header}</Alert.Heading>
                              <p>
                                {alertMessage.body}
                              </p>
                            </Alert>
                          </Col>
                        </Row>
                        <Row>
                          <Col>
                            <Table>
                              <tbody>
                              <tr key="reportAuthor">
                                <th className="details__th">Author</th>
                                <td>
                                  <a href={reportAuthorUrl(reportQuery.data)}>
                                    {reportQuery.data._media[0] === "twitter" ? "@" : ""}
                                    {reportQuery.data.author}
                                  </a>
                                </td>
                              </tr>
                              <tr key="reportAuthoredAt">
                                <th className="details__th">Authored time</th>
                                <td>{stringToDate(reportQuery.data.authoredAt).toLocaleString("en-us")}</td>
                              </tr>
                              {reportQuery.data.metadata.subscriberCount &&
                                  <tr key="reportSubscriberCount">
                                    <th className="details__th">Subscriber count</th>
                                    <td>{reportQuery.data.metadata.subscriberCount}</td>
                                  </tr>
                              }
                              {reportQuery.data.metadata.followerCount &&
                                  <tr key="reportFollowerCount">
                                    <th className="details__th">Followers</th>
                                    <td>{reportQuery.data.metadata.followerCount}</td>
                                  </tr>
                              }
                              {reportQuery.data.metadata.crowdtangleId &&
                                  <tr key="reportCrowdtangleId">
                                    <th className="details__th">Crowdtangle Id</th>
                                    <td>
                                      <span className="me-2">{reportQuery.data.metadata.crowdtangleId}</span>
                                      <CopyToClipboard text={reportQuery.data.metadata.crowdtangleId}>
                                        <Button variant={"outline-secondary"}><FontAwesomeIcon icon={faCopy}/></Button>
                                      </CopyToClipboard>
                                    </td>
                                  </tr>
                              }
                              <tr key="reportUrl">
                                <th className="details__th">URL</th>
                                <td><a href={reportQuery.data.url}>External link</a></td>
                              </tr>
                              {reportQuery.data.metadata.location && reportQuery.data.metadata.location !== "" &&
                                  <tr key="reportLocation">
                                    <th>Location</th>
                                    <td>{reportQuery.data.metadata.location}</td>
                                  </tr>
                              }
                              <tr key="reportSource">
                                <th className="details__th">Source</th>
                                <td>
                                  {sourcesQuery.data && !sourcesNamesById(reportQuery.data._sources, sourcesQuery.data) &&
                                      <s>Source not found.</s>
                                  }
                                  {sourcesQuery.data && sourcesNamesById(reportQuery.data._sources, sourcesQuery.data) &&
                                      <>{sourcesNamesById(reportQuery.data._sources, sourcesQuery.data)}</>
                                  }
                                </td>
                              </tr>
                              <tr key="reportFetchedAt">
                                <th className="details__th">Fetched Time</th>
                                <td>{stringToDate(reportQuery.data.fetchedAt).toLocaleString()}</td>
                              </tr>
                              <tr key="reportVeracity">
                                <th className="details__th">
                                  <VeracityIndication veracity={reportQuery.data.veracity} id={reportQuery.data._id} variant={"title"}/>
                                  Veracity
                                </th>
                                <td>
                                  <Form.Select
                                      onChange={(event) => {
                                        handleVeracityChange(event)
                                      }}
                                      onBlur={() => {
                                        veracityStatusMutation.mutate({
                                          reportId: reportQuery.data?._id || "",
                                          veracity: veracity,
                                        });
                                      }}
                                      value={veracity}
                                  >
                                    {aggieVeracityOptions.map((veracityOption) => {
                                      return <option key={veracityOption} value={veracityOption}>{veracityOption}</option>
                                    })}
                                  </Form.Select>
                                </td>
                              </tr>
                              <tr key="reportEscalated">
                                <th className="details__th">
                                  <EscalatedIndication escalated={reportQuery.data.escalated} id={reportQuery.data._id} variant={"title"}/>
                                  Escalated
                                </th>
                                <td>
                                  <Form.Switch
                                      onBlur={() => {
                                        escalatedStatusMutation.mutate({
                                          reportId: reportQuery.data?._id || "",
                                          escalated: escalated,
                                        })
                                      }}
                                      onChange={handleEscalatedChange}
                                      checked={escalated}
                                  ></Form.Switch>
                                </td>
                              </tr>
                              <tr key="reportGroup">
                                <th className="details__th">Group</th>
                                <td>
                                  {reportGroupQuery.isSuccess && reportGroupQuery.data &&
                                      <span>{reportGroupQuery.data.title}</span>
                                  }
                                </td>
                              </tr>
                              <tr key="reportTags">
                                <th className="details__th">Tags</th>
                                <td>
                                  {tagsQuery.data && reportQuery.data._id &&
                                      <TagsTypeahead
                                          id={reportQuery.data._id}
                                          options={tagsQuery.data}
                                          selected={tags}
                                          onChange={setTags}
                                          onBlur={() => {
                                            tagsUpdateMutation.mutate({
                                              reportId: reportQuery.data?._id || "",
                                              tags: tags,
                                            })
                                          }}
                                          variant={"table"}
                                      />
                                  }
                                </td>
                              </tr>
                              <tr key="reportNotes">
                                <th className="details__th">Notes</th>
                                <td>
                                  <Form.Control
                                      as="textarea"
                                      name="reportNotes"
                                      placeholder="Write notes here"
                                      style={{height: '100px'}}
                                      onChange={handleNotesChange}
                                      onBlur={() => {
                                        notesUpdateMutation.mutate({
                                          notes: notes,
                                          reportId: reportQuery.data?._id || ""
                                        });
                                      }}
                                      value={notes}
                                  />
                                </td>
                              </tr>
                              </tbody>
                            </Table>
                          </Col>
                          {reportQuery.data && (reportQuery.data._media[0] === "twitter") &&
                              <Col>
                                <TwitterDetails report={reportQuery.data}/>
                              </Col>
                          }
                          {reportQuery.data && (reportQuery.data._media[0] === "crowdtangle" || reportQuery.data._media[0] === "facebook") &&
                              <Col>
                                <FacebookMedia
                                    report={reportQuery.data}
                                />
                              </Col>
                          }
                        </Row>
                      </Card.Body>
                    </Card>
                  </>
              }
              {reportQuery.isError && reportQuery.error && reportQuery.error.response && reportQuery.error.response.data && reportQuery.error.response.status &&
                  <ErrorCard errorData={reportQuery.error.response.data} errorStatus={reportQuery.error.response.status}/>
              }
              {reportQuery.isLoading &&
                  <Card>
                    <Card.Header>
                      <ButtonToolbar className="justify-content-end">
                        <Button variant="primary" disabled>
                          <FontAwesomeIcon icon={faEnvelope} className={"me-2"}/> {"Mark read"}
                        </Button>
                      </ButtonToolbar>
                    </Card.Header>
                    <Card.Body>

                    </Card.Body>
                  </Card>
              }
              <div className={"pb-4"}></div>
            </Col>
            <Col>
              <div className="d-none d-xl-block">
                <StatsBar></StatsBar>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
  )
}

interface DetailsIProps {
  report: Report,
}

const FacebookMedia = (props: DetailsIProps) => {
  return (
      <iframe
          src={facebookUrlToEmbedUrl(props.report.url)}
          width="500" height="720" style={{border: "none", overflow: "hidden"}} scrolling="yes" frameBorder="0"
          allowFullScreen={true}
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
      </iframe>
  )
}

const TwitterDetails = (props: DetailsIProps) => {
  return (
      <>
        <h6>Original Tweet</h6>
        <Tweet tweetId={props.report.metadata.tweetID} options={{ theme: "dark" }}/>
      </>
  )
}

export default ReportDetails;


