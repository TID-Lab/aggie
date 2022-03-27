import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import Table from 'react-bootstrap/Table';
import {Card, Button, ButtonToolbar, Form, Image, Container, ButtonGroup} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faPlusCircle, faEnvelopeOpen, faClose} from "@fortawesome/free-solid-svg-icons";
import { Link } from 'react-router-dom';
import EditGroupModal from "../group/EditGroupModal";
import "./ReportTable.css"
import {
  reportFullContent,
  reportImageUrl,
  reportAuthorUrl,
  stringToDate,
  groupById,
  sourceById,
  tagById
} from "../../helpers";
import {Group, Report, Source, Tag} from "../../objectTypes";
import {editReport} from "../../api/reports";
import {useMutation} from "react-query";
import TagsTypeahead from "../tag/TagsTypeahead";

interface IProps {
  visibleReports: Report[];
  sources: Source[] | [];
  tags: Tag[] | [];
  groups: Group[] | [];
  variant: 'batch' | 'relevant' | 'default' | 'group-details';
}

export default function ReportTable(props: IProps) {
  const [selectedReports, setSelectedReports] = useState<Set<string>>(new Set());
  const handleAllSelectChange = () => {
    let newSelectedReports;
    if (selectedReports.size === 0) {
      newSelectedReports = new Set(props.visibleReports.map(report => report._id));
    } else {
      newSelectedReports = new Set<string>();
    }
    setSelectedReports(newSelectedReports);
  }
  const toggleSelectedReportsRead = () => {
    console.log(selectedReports);
  }
  const addSelectedReportsToGroup = () => {
    console.log(selectedReports)
  }

  return (
      <>
        <Card.Header>
          <ButtonToolbar className={"justify-content-between"}>
            <div>
              <Button variant={"secondary"} className="me-2" onClick={toggleSelectedReportsRead}>
                <FontAwesomeIcon icon={faEnvelopeOpen}/>
              </Button>
              <Button variant={"secondary"}>
                <FontAwesomeIcon icon={faPlusCircle} className={"me-2"}/>
                Add to group
              </Button>
              { props.variant === "default" &&
                  <Link to={'/batch'} className={"ms-2"}>
                    <Button variant={"primary"}>
                      Batch mode
                    </Button>
                  </Link>
              }
            </div>
            { props.variant === "batch" &&
                <div>
                  <Button className={"me-2"}>Grab new batch</Button>
                  <Button variant={"outline-danger"}>
                    <FontAwesomeIcon icon={faClose}/>
                  </Button>
                </div>
            }
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
                        variant={"table"}
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
                        variant={"group-details"}
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
  variant: "modal" | "table" | "group-details",
  setSelectedReports?: Dispatch<SetStateAction<Set<string>>>,
  selectedReports?: Set<string>,
}

export function ReportRow(props: ReportRowIProps) {
  const reportMutation = useMutation((report: Report) => { return editReport(report) });
  //@ts-ignore
  const [queryTags, setQueryTags] = useState<Tag[]>(props.report.smtcTags.map((tag) => {return tagById(tag, props.tags)}));
  /**
   * Handle Selected runs when a report is selected via checkbox. In order to track which reports are selected, we use
   * a set that contains selected report _ids to represent selected reports.
   */
  const handleSelected = () => {
    if (props.setSelectedReports && props.selectedReports && props.report?._id) {
      let newSelectedReports = new Set(props.selectedReports);
      if (newSelectedReports.has(props.report._id)) {
        newSelectedReports.delete(props.report._id);
      } else {
        newSelectedReports.add(props.report._id);
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
      case 'table': case 'group-details':
          // @ts-ignore
          // @ts-ignore
          return (
            <tr key={props.report._id} className={(props.report.read) ? "tr--read" : "tr--unread"}>
              <td>
                <Form>
                  { props.selectedReports &&
                      <Form.Check type="checkbox" id={props.report._id} onChange={handleSelected}
                                  checked={props.selectedReports.has(props.report._id)}/>
                  }
                </Form>
              </td>
              <td className="sourceInfo">
                <span>{stringToDate(props.report.authoredAt).toLocaleString("en-us")} {"\n"}</span>
                <a href={reportAuthorUrl(props.report)} target="_blank" className="sourceInfo__link">
                  <b>{props.report.author}</b>
                </a>
                <br/>
                <br/>
                <span>
                    {sourceById(props.report._sources[0], props.sources)?.nickname}
                </span>
                {props.report.metadata.ct_tag && props.report.metadata.ct_tag.length &&
                <> {'>'} {props.report.metadata.ct_tag.map((tag: string) => {return <>{tag}</>})} </>
                }
              </td>
              <td>{reportImageUrl(props.report) &&
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
                      reports={[props.report]}
                      groups={props.groups}
                      groupId={props.report._incident}
                      tags={props.tags}
                      sources={props.sources}
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
                  {props.report._incident
                      ? <>{groupById(props.report._incident, props.groups)}</>
                      : <i>No group selected</i>
                  }
                </Container>
              </td>
            </tr>
        )
        break;
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