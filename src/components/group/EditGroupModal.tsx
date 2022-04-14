import {Alert, Button, Container, Form, Modal, Table} from "react-bootstrap";
import React, {useState} from "react";
// @ts-ignore
import Tags from "@yaireo/tagify/dist/react.tagify";
import {Link, useNavigate} from "react-router-dom";
import {groupById, tagsById} from "../../helpers";
import {ReportRow} from "../report/ReportTable";
import './EditGroupModal.css';
import axios, {AxiosError} from "axios";
import {Group, Groups, GroupSearchState, Report, Reports, Source, Tag, User} from "../../objectTypes";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import {GroupRow} from "./GroupTable";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {getAllGroups, getGroups} from "../../api/groups";
import {getUsers} from "../../api/users";
import {setSelectedEscalated, setSelectedGroup} from "../../api/reports";
import {getSources} from "../../api/sources";
import {getTags} from "../../api/tags";

interface IProps {
  reports: Set<Report>,
  tags: Tag[] | null,
  sources: Source[] | [],
  groupId?: string,
  variant: "inline" | "selection"
}

interface ReportGroupUpdateInfo {
  reportIds: string[] | [],
  _group: Group | null,
}
export default function EditGroupModal(props: IProps) {
  const queryClient = useQueryClient();
  // Depending on the number of groups, this could take a WHILE. Therefore we do this Async to other queries.
  const allGroupsQuery = useQuery<Group[] | undefined, AxiosError>("all-groups", ()=> {return getAllGroups();}, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
    refetchOnWindowFocus: false,
  });
  const [showGroupModal, setShowGroupModal] = useState(false);
  const usersQuery = useQuery<User[] | undefined, AxiosError>("users", getUsers);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    header: "",
    body: "",
  })

  const navigate = useNavigate();
  const [searchState, setSearchState] = useState<GroupSearchState>({
    locationName: null,
    veracity: null,
    escalated: null,
    closed: null,
    totalReports: null,
    assignedTo: null,
    creator: null,
    title: null,
    after: null,
    before: null,
    idnum: null,
    page: 0
  });
  const groupsQuery = useQuery<Groups | undefined, AxiosError>("groups", ()=>{return getGroups(searchState)}, {
    onError: (err: AxiosError) => {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    },
  });
  const sourcesQuery = useQuery<Source[] | undefined, AxiosError>("sources", getSources, {
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

  const [reports, setReports] = useState<Report[]>(Array.from(props.reports));
  const [tempSelectedGroup, setTempSelectedGroup] = useState<Group | null>(null);

  const reportGroupUpdateMutation = useMutation((reportGroupUpdateInfo: ReportGroupUpdateInfo) => {
    return setSelectedGroup(reportGroupUpdateInfo.reportIds, reportGroupUpdateInfo._group);
  }, {
    onSuccess: data => {
      queryClient.invalidateQueries("reports");
    },
    onError: (error: AxiosError) => {
      if (error && error.response && error.response.status && error.response.data) {
        setShowAlert(false);
        setAlertMessage({
          header: "Failed to update group status " + error.response.status,
          body: error.response.data,
        });
        setShowAlert(true);
      } else {
        console.error("Uncaught group update error.")
      }
    }
  });

  const handleClose = () => {
    setShowGroupModal(false);
  }

  const handleShow = () => {
    setShowGroupModal(true);
  }

  const handleSubmit = () => {
    if (tempSelectedGroup) {
      reportGroupUpdateMutation.mutate({
        reportIds: reports.map((report=>{return report._id;})),
        _group: tempSelectedGroup,
      })
    }
  }

  const ReportGroupModalJSX = () => {
    if (reports.length > 0 && showGroupModal) {
      return (
          <>
            <Modal.Header closeButton>
              {reports.length > 1
                  ? <Modal.Title>Edit multiple reports' groups</Modal.Title>
                  : <Modal.Title>Edit report group</Modal.Title>
              }
            </Modal.Header>
            <Modal.Body className="edit__group__modal">
              <Container fluid>
                <Alert variant="danger" onClose={() => setShowAlert(false)} show={showAlert} dismissible>
                  <Alert.Heading>{alertMessage.header}</Alert.Heading>
                  <p>
                    {alertMessage.body}
                  </p>
                </Alert>
                <Table bordered>
                  <thead>
                    <tr>
                      <th>Source info</th>
                      <th>Thumbnail</th>
                      <th>Content</th>
                      <th>Tags</th>
                      <th>Group</th>
                    </tr>
                  </thead>
                  <tbody>
                  { reports.map((report) => {
                    return(
                        <ReportRow
                            variant="modal"
                            key={report._id}
                            report={report}
                            tags={props.tags}
                            selectedGroup={tempSelectedGroup}
                            sources={props.sources}
                        />
                    )
                  })}
                  </tbody>
                </Table>
                <Table hover bordered size={"sm"} className={"m-0"}>
                  <thead>
                    <tr>
                      <th></th>
                      <th>Group Info</th>
                      <th>Location</th>
                      <th>Created</th>
                      <th>Notes</th>
                      <th>Assignee</th>
                      <th>Tags</th>
                    </tr>
                  </thead>
                  <tbody>
                  { usersQuery.isSuccess && groupsQuery.isSuccess && tagsQuery.isSuccess && sourcesQuery.isSuccess &&
                      usersQuery.data && groupsQuery.data && tagsQuery.data && sourcesQuery.data && groupsQuery.data.results.map((group)=>{
                      return (
                          <GroupRow
                              key={group._id}
                              variant='modal'
                              tags={tagsQuery.data}
                              className={tempSelectedGroup === group ? "group--selected" : ""}
                              group={group}
                              users={usersQuery.data}
                              sources={props.sources}
                              onClick={()=>{
                                setTempSelectedGroup(group);
                              }}
                          />);
                  })}
                  </tbody>
                </Table>
              </Container>
            </Modal.Body>
            <Modal.Footer className="edit__group__modal">
              <Button variant="secondary" onClick={handleClose}>Cancel</Button>
              <Button variant="primary" type="submit">Save</Button>
            </Modal.Footer>
          </>
      )
    }
  }
  return (
      <>
        { props.variant === "inline" &&
            <>
              {allGroupsQuery.isSuccess && allGroupsQuery.data ?
                  <>
                    {props.groupId ?
                        <Button variant={"secondary"} className={"group__button"} onClick={handleShow}>
                          {groupById(props.groupId, allGroupsQuery.data) &&
                              <>
                                <span className={"group__title"}>{groupById(props.groupId, allGroupsQuery.data)?.title}</span>
                                <br/>
                                <span className={"group__idnum"}>
                                  {groupById(props.groupId, allGroupsQuery.data)?._reports.length === 1 ?
                                    groupById(props.groupId, allGroupsQuery.data)?._reports.length + " report" :
                                    groupById(props.groupId, allGroupsQuery.data)?._reports.length + " reports"}</span>
                                <br/>
                                <span className={"group__idnum"}>ID: {groupById(props.groupId, allGroupsQuery.data)?.idnum}</span>
                              </>
                          }
                        </Button>
                        : <Button variant={"link"} onClick={handleShow}>
                          Edit
                        </Button>
                    }
                  </> :
                  <Button variant="link" onClick={handleShow}>
                    Loading Groups
                  </Button>
              }
            </>
        }
        { props.variant === "selection" &&
            <Button variant={"secondary"} onClick={handleShow} disabled={reports.length === 0}>
              <FontAwesomeIcon icon={faPlusCircle} className={"me-2"} onClick={()=>{
              }}/>
              Add to group
            </Button>
        }
        <Modal
            show={showGroupModal}
            onHide={handleClose}
            fullscreen={true}
            keyboard={false}
        >
          <Form onSubmit={handleSubmit}>
            {ReportGroupModalJSX()}
          </Form>
        </Modal>
      </>
  )
}