import {
  Alert,
  Button,
  ButtonToolbar,
  Card, Col,
  Container,
  Modal, Row,
  Table
} from "react-bootstrap";
import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {groupById, parseFilterFields, tagsById} from "../../helpers";
import {ReportRow} from "../report/ReportTable";
import styles from './EditGroupModal.module.css';
import {AxiosError} from "axios";
import {Group, Groups, GroupSearchState, Report, Source, Tag, User} from "../../objectTypes";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEdit, faFilter, faGrip, faList, faPlus, faPlusCircle, faSearch} from "@fortawesome/free-solid-svg-icons";
import {GroupRow} from "./GroupTable";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {getAllGroups, getGroups} from "../../api/groups";
import {getUsers} from "../../api/users";
import {setSelectedEscalated, setSelectedGroup} from "../../api/reports";
import {getSources} from "../../api/sources";
import {getTags} from "../../api/tags";
import AggiePagination from "../AggiePagination";
import { Field, Formik, Form } from "formik";

// @ts-ignore
import Tags from "@yaireo/tagify/dist/react.tagify";

const ITEMS_PER_PAGE = 50;

interface IProps {
  reports: Report[],
  tags: Tag[] | null,
  sources: Source[] | [],
  groupId?: string,
  variant: "inline" | "selection",
  size?: "sm" | "lg"
}

interface ReportGroupUpdateInfo {
  reportIds: string[] | [],
  _group: Group | null,
}
export default function EditGroupModal(props: IProps) {
  const queryClient = useQueryClient();
  // Depending on the number of groups, this could take a WHILE. Therefore we do this Async to other queries.
  const allGroupsQuery = useQuery<Group[] | undefined, AxiosError>(["groups", "all"], ()=> {return getAllGroups();}, {
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
  const [queryState, setQueryState] = useState<GroupSearchState>({
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

  const groupsQuery = useQuery<Groups | undefined, AxiosError>(["groups", queryState], ()=>{return getGroups(queryState)}, {
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

  const [reports, setReports] = useState<Report[]>(props.reports);
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

  const goToPage = (pageNum: number) => {
    setQueryState({
      ...queryState,
      page: pageNum
    });
    groupsQuery.refetch();
  }

  const ReportGroupModalJSX = () => {
    if (reports.length > 0 && showGroupModal) {
      return (
          <Container fluid>
            <Alert variant="danger" onClose={() => setShowAlert(false)} show={showAlert} dismissible>
              <Alert.Heading>{alertMessage.header}</Alert.Heading>
              <p>
                {alertMessage.body}
              </p>
            </Alert>
            <Card className="mb-4">
              <Card.Body className="p-0">
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
              </Card.Body>
            </Card>
            <Card>
              <Card.Header className="pe-2 ps-2">
                <ButtonToolbar className={"justify-content-between"}>
                  <div>
                    <Row className="justify-content-start">
                      <Col xs={5} className="pe-1">
                        <Field id="title" name="title" placeholder="Search by name" className="form-control form-control-sm"/>
                      </Col>
                      <Col xs={4} className="pe-0 ps-1">
                        <Field id="idnum" name="idnum" placeholder="Search by ID" className="form-control form-control-sm"/>
                      </Col>
                    </Row>
                  </div>
                  {groupsQuery.data && groupsQuery.data.total &&
                      <AggiePagination
                          goToPage={goToPage}
                          total={groupsQuery.data.total}
                          itemsPerPage={ITEMS_PER_PAGE}
                          variant="modal"
                          size="sm"
                          page={queryState.page}/>
                  }
                </ButtonToolbar>
              </Card.Header>
              <Card.Body className="p-0">
                {/* TODO: See if we can move this into Group Table as it makes more sense there. */}
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
                        if (group == tempSelectedGroup) {
                          return (
                              <GroupRow
                                  key={group._id}
                                  variant='modal'
                                  tags={tagsQuery.data}
                                  selected
                                  className={tempSelectedGroup === group ? styles.groupSelected : undefined}
                                  group={group}
                                  users={usersQuery.data}
                                  sources={props.sources}
                                  onClick={()=>{
                                    setTempSelectedGroup(group);
                                  }}
                              />
                          )
                        } else {
                          return (
                              <GroupRow
                                  key={group._id}
                                  variant='modal'
                                  tags={tagsQuery.data}
                                  className={tempSelectedGroup === group ? styles.groupSelected : undefined}
                                  group={group}
                                  users={usersQuery.data}
                                  sources={props.sources}
                                  onClick={()=>{
                                    setTempSelectedGroup(group);
                                  }}
                              />);
                        }
                      })}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          </Container>
      );
    }
  }
  // @ts-ignore
  return (
      <>
        { props.variant === "inline" &&
            <>
              {allGroupsQuery.isSuccess && allGroupsQuery.data ?
                  <>
                    {props.groupId ?
                        <Button variant={"secondary"} className={styles.group__button} onClick={handleShow}>
                          {groupById(props.groupId, allGroupsQuery.data) &&
                              <>
                                <span className={styles.group__title}>{groupById(props.groupId, allGroupsQuery.data)?.title}</span>
                                <br/>
                                <span className={styles.group__totalReports}>
                                  {groupById(props.groupId, allGroupsQuery.data)?._reports.length === 1 ?
                                    groupById(props.groupId, allGroupsQuery.data)?._reports.length + " report" :
                                    groupById(props.groupId, allGroupsQuery.data)?._reports.length + " reports"}</span>
                                <br/>
                                <span className={styles.group__idnum}>ID: {groupById(props.groupId, allGroupsQuery.data)?.idnum}</span>
                              </>
                          }
                        </Button>
                        : <Button variant={"link"} onClick={handleShow}>
                          <FontAwesomeIcon icon={faPlus}/>
                        </Button>
                    }
                  </> :
                  <>
                    { props.reports[0] && props.reports[0]._group &&
                        <Button variant="secondary" disabled>
                          Loading...
                        </Button>
                    }
                  </>
              }
            </>
        }
        { props.variant === "selection" &&
            <Button variant={"secondary"} onClick={handleShow} disabled={reports.length === 0} size={props.size ? props.size : undefined}>
              <FontAwesomeIcon icon={faPlusCircle} className={"me-2"} onClick={()=>{
              }}/>
              Add to group
            </Button>
        }
        <Formik
            initialValues={{
              idnum: "",
              title: "",
            }}
            onSubmit={(values, {setSubmitting, resetForm}) => {
              if (tempSelectedGroup) {
                reportGroupUpdateMutation.mutate({
                  reportIds: reports.map((report=>{return report._id;})),
                  _group: tempSelectedGroup,
                }, {
                  onSuccess: ()=>setShowGroupModal(false)
                })
              }
            }}
        >
          {({
              values,
              errors,
              handleSubmit,
            }) => (
              <Form>
                <Modal
                    show={showGroupModal}
                    onHide={handleClose}
                    fullscreen={true}
                    keyboard={false}
                >
                  <Modal.Header closeButton>
                    {reports.length > 1
                        ? <Modal.Title>Edit multiple reports' groups</Modal.Title>
                        : <Modal.Title>Edit report's group</Modal.Title>
                    }
                  </Modal.Header>
                  <Modal.Body className={styles.editGroup__modal}>
                    {ReportGroupModalJSX()}
                  </Modal.Body>
                  <Modal.Footer className={styles.editGroup__modal}>
                    <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                    {/*@ts-ignore*/}
                    <Button variant="primary" type="submit" onClick={handleSubmit}>Save</Button>
                  </Modal.Footer>
                </Modal>
              </Form>
          )}
        </Formik>
      </>
  )
}