import React, {useState} from 'react';
import {AxiosError} from 'axios';
import {
  Container,
  Col,
  Row,
  Card,
  Table,
  ButtonGroup,
  ButtonToolbar,
  Form, Pagination
} from "react-bootstrap";
import StatsBar from '../../components/StatsBar';
import ConfirmModal from "../../components/ConfirmModal";
import {useParams, useSearchParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {editGroup, getGroup, getGroupReports, getGroups, setSelectedClosed} from "../../api/groups";
import {getSources} from "../../api/sources";
import {getTags} from "../../api/tags";
import {Group, hasId, Report, Reports, Source, Tag, Veracity} from "../../objectTypes";
import {aggieVeracityOptions, stringToDate, tagById, tagsById} from "../../helpers";
import ReportTable from "../../components/report/ReportTable";
import TagsTypeahead from "../../components/tag/TagsTypeahead";
import {setSelectedEscalated} from "../../api/groups";
import {setSelectedNotes} from "../../api/groups";
import {setSelectedVeracity} from "../../api/groups";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCheckCircle, faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import {faCircle} from "@fortawesome/free-regular-svg-icons";
import VeracityIndication from "../../components/VeracityIndication";
import EscalatedIndication from "../../components/EscalatedIndication";
import AggiePagination from "../../components/AggiePagination";
const ITEMS_PER_PAGE = 50;

interface VeracityUpdateInfo {
  groupId: string,
  veracity: Veracity | string,
}
interface NotesUpdateInfo {
  groupId: string,
  notes: string
}
interface EscalatedUpdateInfo {
  groupId: string,
  escalated: boolean
}
interface ClosedUpdateInfo {
  groupId: string,
  closed: boolean
}
interface TagsUpdateInfo {
  groupId: string,
  tags: hasId[]
}

const GroupDetails = () => {
  let { id } = useParams<{id: string}>();
  // This is the state of the URL
  const [searchParams, setSearchParams] = useSearchParams();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState({header: "", body: ""});
  const [veracity, setVeracity] = useState<Veracity | string>("Unconfirmed");
  const [escalated, setEscalated] = useState(true);
  const [closed, setClosed] = useState(true);
  const [notes, setNotes] = useState("");
  const [pageNumber, setPageNumber] = useState(Number(searchParams.get('page') || "0"));
  const goToPage = (page: number) => {
    setSearchParams({
      page: String(page)
    });
    setPageNumber(page);
  }
  const handleEscalatedChange = (event: React.ChangeEvent<HTMLInputElement>) => setEscalated(event.target.checked);
  const handleClosedChange = (event: React.ChangeEvent<HTMLInputElement>) => setClosed(event.target.checked);
  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => setNotes(event.target.value);
  const handleVeracityChange = (event: React.ChangeEvent<HTMLSelectElement>) => setVeracity(event.target.value);
  const groupMutation = useMutation((group: Group) => { return editGroup(group) });
  const escalatedStatusMutation = useMutation((escalatedUpdateInfo: EscalatedUpdateInfo) => {
    return setSelectedEscalated([escalatedUpdateInfo.groupId], escalatedUpdateInfo.escalated);
  }, {
    onSuccess: data => groupQuery.refetch(),
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
    return setSelectedVeracity([veracityUpdateInfo.groupId], veracityUpdateInfo.veracity);
  }, {
    onSuccess: data => {
      // TODO: Instead of refetching, just use a React useState to adjust the UI on Success
      groupQuery.refetch();
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
    return setSelectedNotes([notesUpdateInfo.groupId], notesUpdateInfo.notes);
  }, {
    onSuccess: data => {
      // TODO: Instead of refetching, just use a React useState to adjust the UI on Success
      groupQuery.refetch();
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
  const closedStatusMutation = useMutation((closedUpdateInfo: ClosedUpdateInfo) => {
    return setSelectedClosed([closedUpdateInfo.groupId], closedUpdateInfo.closed);
  }, {
    onSuccess: data => {
      // TODO: Instead of refetching, just use a React useState to adjust the UI on Success
      groupQuery.refetch();
    },
    onError: (error: AxiosError) => {
      if (error && error.response && error.response.status && error.response.data) {
        setShowAlert(false);
        setAlertMessage({
          header: "Failed to update closed status " + error.response.status,
          body: error.response.data,
        });
        setShowAlert(true);
      } else {
        console.error("Uncaught closed update error.")
      }
    }
  });
  const sourcesQuery = useQuery<Source[], undefined>("sources", getSources);
  const tagsQuery = useQuery<Tag[], undefined>("tags", getTags);
  //@ts-ignore
  const groupQuery = useQuery<Group, undefined>(["group", id], () => getGroup(id), {
    enabled: tagsQuery.isSuccess,
    onSuccess: data => {
      if (tagsQuery.data) {
        const tags = data.smtcTags.map((tag) => {return tagById(tag, tagsQuery.data)}) || []
        //@ts-ignore TODO: Figure out how to type this so it doesn't throw an error this is because tagById could return null
        setQueryTags(tags);
      }
      setEscalated(data.escalated);
      setClosed(data.closed);
      setNotes(data.notes || "");
      setVeracity(data.veracity);
    }
  });
  const groupReportsQuery = useQuery<Reports, undefined>(
      ["reports", {groupId: id}], ()=> getGroupReports(id, pageNumber),
  );
  const [queryTags, setQueryTags] = useState<Tag[]>([]);
  const handleTagsBlur = () => {
    if (groupQuery.isSuccess && groupQuery.data && queryTags) {
      // Shallow copy so we don't change the original query data
      let groupCopy = Object.assign({}, groupQuery.data);
      groupCopy.smtcTags = queryTags.map((tag)=> {return tag._id});
      groupMutation.mutate(groupCopy);
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
                {groupQuery.isSuccess && groupQuery.data &&
                    <>
                      <h3>
                        <span className={"me-2"}>Group details</span>
                      </h3>
                      <Card className="mt-4">
                        <Card.Header>
                          <ButtonToolbar
                              className="justify-content-end"
                              aria-label="Toolbar with Button groups"
                          >
                            <ButtonGroup className={"me-2"}>
                            </ButtonGroup>
                            <ButtonGroup>
                              <ConfirmModal type={"delete"} group={groupQuery.data} variant={"button"}></ConfirmModal>
                            </ButtonGroup>
                          </ButtonToolbar>
                        </Card.Header>
                        <Card.Body>
                          <Table>
                            <tbody>
                            { groupQuery.data &&
                            <>
                              <tr>
                                <th>Name</th>
                                <td>{groupQuery.data.title}</td>
                              </tr>
                              <tr>
                                <th>ID</th>
                                <td>{groupQuery.data.idnum}</td>
                              </tr>
                              <tr>
                                <th>Location</th>
                                <td>{groupQuery.data.locationName}</td>
                              </tr>
                              <tr>
                                <th>Created by</th>
                                <td>
                                  {groupQuery.data.creator ? groupQuery.data.creator.username + " at " + (stringToDate(groupQuery.data.storedAt)).toLocaleString("en-US")
                                      : "Deleted user"}
                                </td>
                              </tr>
                              <tr>
                                <th>Last updated</th>
                                <td>{(stringToDate(groupQuery.data.updatedAt)).toLocaleString("en-US")}</td>
                              </tr>
                              <tr>
                                <th>
                                  <VeracityIndication veracity={groupQuery.data.veracity} id={groupQuery.data._id} variant={"title"}/>
                                  Veracity
                                </th>
                                <td>
                                  <Form.Select
                                      onChange={handleVeracityChange}
                                      onBlur={()=> {
                                        veracityStatusMutation.mutate({
                                          groupId: groupQuery.data._id,
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
                              <tr>
                                <th>
                                  <EscalatedIndication escalated={groupQuery.data.escalated} id={groupQuery.data._id} variant={"title"}/>
                                  <span>Escalated</span>
                                </th>
                                <td>
                                  <Form.Switch
                                      onBlur={()=> {
                                        escalatedStatusMutation.mutate({
                                          groupId: groupQuery.data._id,
                                          escalated: escalated,
                                        })
                                      }}
                                      onChange={handleEscalatedChange}
                                      checked={escalated}
                                  ></Form.Switch>
                                </td>
                              </tr>
                              <tr>
                                <th>Closed</th>
                                <td>
                                  <Form.Switch
                                      onBlur={()=> {
                                        closedStatusMutation.mutate({
                                          groupId: groupQuery.data._id,
                                          closed: closed,
                                        })
                                      }}
                                      onChange={handleClosedChange}
                                      checked={closed}
                                  />
                                </td>
                              </tr>
                              <tr>
                                  <th>Tags</th>
                                  <td>
                                    {tagsQuery.data && groupQuery.data && groupQuery.data._id &&
                                    <TagsTypeahead
                                        id={groupQuery.data._id}
                                        options={tagsQuery.data}
                                        selected={queryTags}
                                        onChange={setQueryTags}
                                        onBlur={handleTagsBlur}
                                        variant={"table"}
                                    />
                                    }
                                  </td>
                              </tr>
                              <tr>
                                <th>Notes</th>
                                <td>
                                  <Form>
                                    <Form.Control
                                        as="textarea"
                                        name="reportNotes"
                                        placeholder="Write notes here"
                                        style={{height: '100px'}}
                                        onBlur={()=> {
                                          notesUpdateMutation.mutate({
                                            groupId: groupQuery.data._id,
                                            notes: notes,
                                          })
                                        }}
                                        onChange={handleNotesChange} value={notes}
                                    />
                                  </Form>
                                </td>
                              </tr>
                            </>
                            }
                            </tbody>
                          </Table>
                        </Card.Body>
                      </Card>
                      <h3 className="mt-4">Group reports</h3>
                      {groupReportsQuery.isSuccess && sourcesQuery.isSuccess && groupReportsQuery.data && groupQuery.data && sourcesQuery.data && tagsQuery.data &&
                      <Card>
                        <ReportTable
                            visibleReports={groupReportsQuery.data.results}
                            sources={sourcesQuery.data}
                            tags={tagsQuery.data}
                            variant={"group-details"}
                        />
                        <Card.Footer>
                          {groupReportsQuery.data.total > ITEMS_PER_PAGE &&
                              <AggiePagination goToPage={goToPage} total={groupReportsQuery.data.total}
                                               itemsPerPage={ITEMS_PER_PAGE}/>
                          }
                        </Card.Footer>
                      </Card>
                  }
                  <div className={"pb-4"}></div>
                </>
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

export default GroupDetails;


