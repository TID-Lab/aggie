import React, {Dispatch, SetStateAction, useEffect, useRef, useState} from "react";
import Table from 'react-bootstrap/Table';
import {
  Card,
  Button,
  ButtonToolbar,
  Form,
  Image,
  Container,
  Placeholder,
  Tooltip, OverlayTrigger,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {Link, useSearchParams} from 'react-router-dom';
import EditGroupModal from "../group/EditGroupModal";
import "./ReportTable.css"
import {
  reportFullContent,
  reportImageUrl,
  reportAuthorUrl,
  stringToDate,
  groupById,
  sourceById,
  tagById,
  reportAuthor, capitalizeFirstLetter
} from "../../helpers";
import {Group, Report, Source, Tag} from "../../objectTypes";
import {editReport, setSelectedRead} from "../../api/reports";
import {useMutation, useQueryClient} from "react-query";
import TagsTypeahead from "../tag/TagsTypeahead";
import {faCircle} from "@fortawesome/free-regular-svg-icons";
import {faArrowUpRightFromSquare} from "@fortawesome/free-solid-svg-icons";
import {faCheckCircle, faEnvelopeOpen, faLink, faPlusCircle, faTimesCircle, faWarning} from "@fortawesome/free-solid-svg-icons";
import VeracityIndication from "../VeracityIndication";
import EscalatedIndication from "../EscalatedIndication";

interface IProps {
  visibleReports: Report[],
  sources: Source[] | [],
  tags: Tag[] | [],
  groups: Group[] | [],
  batchMode?: boolean,
  setBatchMode?: (batchMode: boolean) => void,
  variant: "modal" | "default" | "group-details" | "relevant" | "batch",
}

export default function ReportTable(props: IProps) {
  const queryClient = useQueryClient();
  const [selectedReports, setSelectedReports] = useState<Set<Report>>(new Set());
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedReadStatusMutation = useMutation(() => {
    let allRead = true;
    selectedReports.forEach((report)=> {
      if (!report.read) {
        allRead = false;
      }
    })
    let selectedReportsArr = Array.from(selectedReports);
    return setSelectedRead(selectedReportsArr.map((selectedReport)=>{return selectedReport._id}), !allRead);
  }, {
    onSuccess: (data) => {
      queryClient.invalidateQueries("batch")
    }
  });

  const handleAllSelectChange = () => {
    let newSelectedReports;
    if (selectedReports.size === 0) {
      newSelectedReports = new Set(props.visibleReports);
    } else {
      newSelectedReports = new Set<Report>();
    }
    setSelectedReports(newSelectedReports);
  }
  return (
      <>
        <Card.Header>
          <ButtonToolbar className={"justify-content-between"}>
            <div>
              <Button variant={"secondary"} className="me-2" disabled={selectedReports.size === 0} onClick={()=> {
                selectedReadStatusMutation.mutate();
              }}>
                <FontAwesomeIcon className={"me-2"} icon={faEnvelopeOpen}/>
                Read/Unread
              </Button>
              <EditGroupModal
                  reports={selectedReports}
                  tags={props.tags}
                  groups={props.groups}
                  sources={props.sources}
                  groupId={undefined}
                  variant={"selection"}
              />
              { props.variant === "default" &&
                  <Button variant={"primary"} className={"ms-2"} onClick={()=>{
                    if (props.setBatchMode) {
                      setSearchParams(
                          {
                            ...searchParams,
                            batch: "true"
                          }
                      )
                      props.setBatchMode(true);
                    }
                  }}>
                    Batch mode
                  </Button>
              }
            </div>
          </ButtonToolbar>
        </Card.Header>
        <Table bordered hover size="sm" className={"m-0"}>
          <thead>
          <tr>
            <th>
              <Form>
                <Form.Check
                    type="checkbox"
                    id={"select-all"}
                    onChange={handleAllSelectChange}
                    checked={selectedReports.size > 0}
                />
              </Form>
            </th>
            <th>Source Info</th>
            <th>Thumbnail</th>
            <th>Content</th>
            {props.variant === "relevant" &&
                <th>Notes</th>
            }
            <th>Tags</th>
            {props.variant !== "group-details" &&
                <th>Group</th>
            }
          </tr>
          </thead>
          <tbody>
          { props.visibleReports && props.visibleReports.length > 0 && props.variant !== "group-details"
              && props.visibleReports.map((report: Report) => {
                return (
                    <ReportRow
                        variant={props.variant}
                        key={report._id}
                        report={report}
                        tags={props.tags}
                        groups={props.groups}
                        sources={props.sources}
                        setSelectedReports={setSelectedReports}
                        selectedReports={selectedReports}
                    />
                )
              })
          }
          { props.visibleReports && props.visibleReports.length > 0 && props.variant === "group-details" &&
              props.visibleReports.map((report: Report) => {
                return (
                    <ReportRow
                        variant={props.variant}
                        key={report._id}
                        report={report}
                        tags={props.tags}
                        groups={props.groups}
                        sources={props.sources}
                        setSelectedReports={setSelectedReports}
                        selectedReports={selectedReports}
                    />
                )
              })
          }
          { props.visibleReports && props.visibleReports.length === 0 &&
              <tr key="empty">
                <td>
                  No reports found.
                </td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
          }
          </tbody>
        </Table>
      </>
  );
}

interface ReportRowIProps {
  report: Report | null,
  tags: Tag[] | null,
  groups: Group[] | [],
  sources: Source[] | [],
  variant: "modal" | "default" | "group-details" | "relevant" | "batch",
  setSelectedReports?: Dispatch<SetStateAction<Set<Report>>>,
  selectedReports?: Set<Report>,
}

export function ReportRow(props: ReportRowIProps) {
  const reportMutation = useMutation((report: Report) => {return editReport(report)}, {
    onSuccess: ()=> {
      if (props.report && props.report.read === false) {
        props.report.read = true
      }
    }
  });
  //@ts-ignore
  const [queryTags, setQueryTags] = useState<Tag[]>(props.report.smtcTags.map((tag) => {return tagById(tag, props.tags)}));
  /**
   * Handle Selected runs when a report is selected via checkbox. In order to track which reports are selected, we use
   * a set that contains selected report _ids to represent selected reports.
   */
  const handleSelected = () => {
    if (props.setSelectedReports && props.selectedReports && props.report?._id) {
      let newSelectedReports = new Set(props.selectedReports);
      if (newSelectedReports.has(props.report)) {
        newSelectedReports.delete(props.report);
      } else {
        newSelectedReports.add(props.report);
      }
      props.setSelectedReports(newSelectedReports);
    }
  }
  const handleTagsBlur = () => {
    if (props.report && queryTags) {
      props.report.smtcTags = queryTags.map((tag)=> {return tag._id});
      reportMutation.mutate(props.report);
    }
  }

  if (props.report) {
    switch (props.variant) {
      case 'default': case "batch": case 'group-details':
          // @ts-ignore
          return (
            <tr key={props.report._id} className={(props.report.read) ? "tr--read" : "tr--unread"}>
              <td>
                <Form>
                  { props.selectedReports &&
                      <Form.Check type="checkbox" id={props.report._id} onChange={handleSelected}
                                  checked={props.selectedReports.has(props.report)}/>
                  }
                </Form>
              </td>
              <td className="sourceInfo">
                <span>{stringToDate(props.report.authoredAt).toLocaleTimeString()}</span>
                <br/>
                <span>{stringToDate(props.report.authoredAt).toLocaleDateString()}</span>
                <br/>
                <a href={reportAuthorUrl(props.report)} target="_blank" className="sourceInfo__link">
                  <b>{reportAuthor(props.report)}</b>
                </a>
                <br/>
                <span>
                    {sourceById(props.report._sources[0], props.sources)?.nickname}
                </span>
                {props.report.metadata && props.report.metadata.ct_tag && props.report.metadata.ct_tag.length && props.report.metadata.ct_tag.map &&
                <> {'>'} {props.report.metadata.ct_tag.map((tag: string) => {return <>{tag}</>})} <br/></>
                }
                <br/>
                <a href={props.report.url} target="_blank" className="sourceInfo__link">
                  {capitalizeFirstLetter(props.report._media[0])} <FontAwesomeIcon icon={faArrowUpRightFromSquare}></FontAwesomeIcon>
                </a>
              </td>
              <td className={"td__image"}>{reportImageUrl(props.report) &&
              <a href={props.report.url}><Image thumbnail src={reportImageUrl(props.report)}></Image></a>}
              </td>
              <td className="text-break content">
                <Link to={'/report/' + props.report._id} target="_blank" rel="noopener noreferrer" className="content__link">
                  {/* This is a janky method of showing full tweets instead of shorted ones */}
                  {reportFullContent(props.report)
                      ? <>{reportFullContent(props.report)}</>
                      : <>{props.report.content}</>
                  }
                </Link>
              </td>
              <td>
                {props.tags && props.report && props.report._id &&
                <TagsTypeahead
                    id={props.report._id}
                    options={props.tags}
                    selected={queryTags}
                    onChange={setQueryTags}
                    onBlur={handleTagsBlur}
                    variant={"table"}
                />
                }
              </td>
              {props.variant !== "group-details" &&
              <td className="align-middle">
                <div className="d-flex justify-content-center">
                  <EditGroupModal
                      reports={new Set([props.report])}
                      groups={props.groups}
                      groupId={props.report._group}
                      tags={props.tags}
                      sources={props.sources}
                      variant={'inline'}
                  />
                </div>
              </td>
              }
            </tr>
        )
        break;
      case 'modal':
        return (
            <tr key={props.report._id}>
              <td className="sourceInfo">
                Posted at {new Date(props.report.authoredAt).toLocaleString("en-us")} by {" "}
                <a href={reportAuthorUrl(props.report)} className="sourceInfo__link">
                  {props.report.author}
                </a>
              </td>
              <td>{reportImageUrl(props.report) &&
              <a href={props.report.url}><Image thumbnail src={reportImageUrl(props.report)}></Image></a>}</td>
              <td className="text-break content">
                <Link to={'/props.report/' + props.report._id} className="content__link">
                  {/* This is a janky method of showing full tweets instead of shorted ones */}
                  {reportFullContent(props.report)
                      ? <>{reportFullContent(props.report)}</>
                      : <>{props.report.content}</>
                  }
                </Link>
              </td>
              <td>

              </td>
              <td>
                <Container fluid>
                  {props.report._group
                      ? <>{groupById(props.report._group, props.groups)}</>
                      : <i>No group selected</i>
                  }
                </Container>
              </td>
            </tr>
        )
        break;
      case "relevant":
        return(
            <tr key={props.report._id}>
              <td>
                <Form>
                  { props.selectedReports &&
                      <Form.Check type="checkbox" id={props.report._id} onChange={handleSelected}
                                  checked={props.selectedReports.has(props.report)}/>
                  }
                </Form>
              </td>
              <td className="sourceInfo">
                <VeracityIndication veracity={props.report.veracity} id={props.report._id}/>
                <EscalatedIndication escalated={props.report.escalated} id={props.report._id}/>
                <span>{stringToDate(props.report.authoredAt).toLocaleTimeString()}</span>
                <br/>
                <span>{stringToDate(props.report.authoredAt).toLocaleDateString()}</span>
                <br/>
                <a href={reportAuthorUrl(props.report)} target="_blank" className="sourceInfo__link">
                  <b>{reportAuthor(props.report)}</b>
                </a>
                <br/>
                <span>
                    {sourceById(props.report._sources[0], props.sources)?.nickname}
                </span>
                {props.report.metadata && props.report.metadata.ct_tag && props.report.metadata.ct_tag.length && props.report.metadata.ct_tag.map &&
                    <> {'>'} {props.report.metadata.ct_tag.map((tag: string) => {return <>{tag}</>})} <br/></>
                }
                <br/>
                <a href={props.report.url} target="_blank" className="sourceInfo__link">
                  {capitalizeFirstLetter(props.report._media[0])} <FontAwesomeIcon icon={faArrowUpRightFromSquare}></FontAwesomeIcon>
                </a>
              </td>
              <td className={"td__image"}>{reportImageUrl(props.report) &&
                  <a href={props.report.url}><Image thumbnail src={reportImageUrl(props.report)}></Image></a>}
              </td>
              <td className="text-break content">
                <Link to={'/report/' + props.report._id} target="_blank" rel="noopener noreferrer" className="content__link">
                  {/* This is a janky method of showing full tweets instead of shorted ones */}
                  {reportFullContent(props.report)
                      ? <>{reportFullContent(props.report)}</>
                      : <>{props.report.content}</>
                  }
                </Link>
              </td>
              <td className={"td__notes"}>
                <Form.Control as="textarea" rows={4} disabled defaultValue={props.report.notes}/>
              </td>
              <td>
                {props.tags && props.report && props.report._id &&
                    <TagsTypeahead
                        id={props.report._id}
                        options={props.tags}
                        selected={queryTags}
                        onChange={setQueryTags}
                        onBlur={handleTagsBlur}
                        variant={"table"}
                    />
                }
              </td>
              <td></td>
            </tr>
        );
    }
  } else {
    return (
        <tr key="empty">
          <td>
            No report found.
          </td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
    )
  }
}

export const LoadingReportTable = () => {
  return (
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
            <Button variant={"primary"} disabled aria-disabled={true}>
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
  )
}