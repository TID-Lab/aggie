import React, {Component, useEffect, useState} from 'react';
import  {AxiosError} from 'axios';
import {Container, Col, Row, Card, Table, Form, ButtonToolbar, Button} from "react-bootstrap";
import StatsBar from '../../components/StatsBar';
import { Tweet } from "react-twitter-widgets";
import {
  tagsById,
  sourcesById,
  reportAuthorUrl,
  stringToDate,
  facebookUrlToEmbedUrl,
  tagById,
  groupById, sourcesNamesById
} from "../../helpers";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {editReport, getReport} from "../../api/reports";
import {getSources} from "../../api/sources";
import {getGroups} from "../../api/groups";
import {getTags} from "../../api/tags";
// @ts-ignore
import { FacebookProvider, Like } from 'react-facebook';
import {Group, Groups, Report, Source, Tag} from "../../objectTypes";
import TagsTypeahead from "../../components/tag/TagsTypeahead";
import * as Yup from "yup";
import {Formik} from "formik";

const editReportFormSchema = Yup.object().shape({
  reportVeracity: Yup.string(),
  reportEscalated: Yup.boolean(),
  reportNotes: Yup.string(),
  reportRead: Yup.string(),
});

const ReportDetails = () => {
  let { id } = useParams<{id: string}>();
  const queryClient = useQueryClient();
  const reportQuery = useQuery<Report, AxiosError>(["report", id], () => getReport(id));
  const sourcesQuery = useQuery<Source[], AxiosError>("sources", getSources);
  const groupsQuery = useQuery<Groups, AxiosError>("groups", getGroups);
  const tagsQuery = useQuery<Tag[], AxiosError>("tags", getTags);

  return (
      <div className={"mt-4"}>
        <Container fluid>
          <Row>
            <Col></Col>
            <Col xl={9}>
              <h3 className={"mb-4"}>Report details</h3>
              <Card>
                {reportQuery.isFetched && tagsQuery.isFetched && sourcesQuery.isFetched && groupsQuery.isFetched &&
                <Card.Body>
                  {reportQuery.data && groupsQuery.data && sourcesQuery.data && tagsQuery.data &&
                  reportQuery.data._media[0] === "twitter" &&
                  <TwitterDetails
                      report={reportQuery.data}
                      tags={tagsQuery.data}
                      sources={sourcesQuery.data}
                      groups={groupsQuery.data.results}
                  />
                  }
                  {reportQuery.data && groupsQuery.data && sourcesQuery.data && tagsQuery.data &&
                      (reportQuery.data._media[0] === "crowdtangle" || reportQuery.data._media[0] === "facebook") &&
                  <FacebookDetails
                      report={reportQuery.data}
                      tags={tagsQuery.data}
                      sources={sourcesQuery.data}
                      groups={groupsQuery.data.results}
                  />
                  }
                </Card.Body>
                }
              </Card>
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
  tags: Tag[],
  groups: Group[],
  sources: Source[],
}

const FacebookDetails = (props: DetailsIProps) => {
  const [copied, setCopied] = useState(false);
  //@ts-ignore
  const [queryTags, setQueryTags] = useState<Tag[]>(props.report.smtcTags.map((tag) => {return tagById(tag, props.tags)}));
  const reportMutation = useMutation((report: Report) => { return editReport(report) });

  const handleTagsBlur = () => {
    if (props.report && queryTags) {
      let updatedReport = {...props.report};
      updatedReport.smtcTags = queryTags.map((tag)=> {return tag._id});
      reportMutation.mutate(updatedReport);
    }
  }

  return (
      <Formik
          initialValues={{
            reportVeracity: props.report.veracity,
            reportEscalated: props.report.escalated,
            reportNotes: props.report.notes,
            reportRead: props.report.read,
          }}
          validationSchema={editReportFormSchema}
          onSubmit={async (values, {setSubmitting, resetForm}) => {
            console.log(values);
          }}
      >
        {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            isSubmitting,
            setValues,
            /* and other goodies */
          }) => (
              <Form>
                <Row>
                  <Col>
                    <Table>
                      <tbody>
                      <tr>
                        <th>Author handle</th>
                        <td><a href={reportAuthorUrl(props.report)}>{props.report.author}</a></td>
                      </tr>
                      <tr>
                        <th>Authored time</th>
                        <td>{stringToDate(props.report.authoredAt).toLocaleString("en-us")}</td>
                      </tr>
                      <tr>
                        <th>Subscriber count</th>
                        <td>{props.report.metadata.subscriberCount}</td>
                      </tr>
                      <tr>
                        <th>Crowdtangle Id</th>
                        <td>
                          <span className="me-2">{props.report.metadata.crowdtangleId}</span>
                          <CopyToClipboard text={props.report.metadata.crowdtangleId}>
                            <Button variant={"outline-secondary"}><FontAwesomeIcon icon={faCopy}/></Button>
                          </CopyToClipboard>
                        </td>
                      </tr>
                      <tr>
                        <th>URL</th>
                        <td><a href={props.report.url}>External link</a></td>
                      </tr>
                      { props.report.metadata.location && props.report.metadata.location !== "" &&
                      <tr>
                        <th>Location</th>
                        <td>{props.report.metadata.location}</td>
                      </tr>
                      }
                      <tr>
                        <th>Source</th>
                        <td>
                          { props.sources &&
                          <>{sourcesNamesById(props.report._sources, props.sources)}</>
                          }
                        </td>
                      </tr>
                      <tr>
                        <th>Fetched Time</th>
                        <td>{stringToDate(props.report.fetchedAt).toLocaleString("en-us")}</td>
                      </tr>
                      <tr>
                        <th>Veracity</th>
                        <td>{props.report.veracity}</td>
                      </tr>
                      <tr>
                        <th>Escalated</th>
                        <td>
                          <Form.Switch name="reportEscalated" checked={values.reportEscalated} onChange={handleChange}></Form.Switch>
                        </td>
                      </tr>
                      <tr>
                        <th>Group</th>
                        {props.report && props.report._incident &&
                        <td>{groupById(props.report._incident, props.groups)}</td>
                        }
                        {props.report && !props.report._incident &&
                        <td></td>
                        }
                      </tr>
                      <tr>
                        <th>Tags</th>
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
                      </tr>
                      <tr>
                        <th>Notes</th>
                        <td>
                          <Form.Control
                              as="textarea"
                              name="reportNotes"
                              placeholder="Write notes here"
                              style={{height: '100px'}}
                              value={values.reportNotes}
                              onChange={handleChange}
                          />
                        </td>
                      </tr>
                      </tbody>
                    </Table>
                  </Col>
                  <Col>
                    <iframe
                        src={facebookUrlToEmbedUrl(props.report.url)}
                        width="500" height="720" style={{border: "none", overflow: "hidden"}} scrolling="yes" frameBorder="0"
                        allowFullScreen={true}
                        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
                    </iframe>
                  </Col>
                </Row>
              </Form>
            )}
      </Formik>
  )
}

const TwitterDetails = (props: DetailsIProps) => {
  return (
      <Form>
        <Row>
          { props.report &&
          <>
            <Col>
              <Table>
                <tbody>
                <tr>
                  <th>Author handle</th>
                  <td><a href={reportAuthorUrl(props.report)}>{props.report.author}</a></td>
                </tr>
                <tr>
                  <th>Authored time</th>
                  <td>{props.report.authoredAt}</td>
                </tr>
                <tr>
                  <th>Author subscriber count</th>
                  <td>{props.report.metadata.followerCount}</td>
                </tr>
                <tr>
                  <th>URL</th>
                  <td><a href={props.report.url}>External link</a></td>
                </tr>
                { props.report.metadata.location && props.report.metadata.location !== "" &&
                <tr>
                  <th>Location</th>
                  <td>{props.report.metadata.location}</td>
                </tr>
                }
                </tbody>
              </Table>
              <br/>
              <Table>
                <tbody>
                <tr>
                  <th>Source</th>
                  <td>
                    { props.sources &&
                    <>{ sourcesById(props.report._sources, props.sources) }</>
                    }
                  </td>
                </tr>
                <tr>
                  <th>Fetched Time</th>
                  <td>{props.report.fetchedAt}</td>
                </tr>
                <tr>
                  <th>Veracity</th>
                  <td>{props.report.veracity}</td>
                </tr>
                <tr>
                  <th>Escalated</th>
                  <td>
                    {props.report.escalated
                        ? <>True</>
                        : <>False</>
                    }
                  </td>
                </tr>
                <tr>
                  <th>Group</th>
                  <td>{props.report._incident}</td>
                </tr>
                <tr>
                  <th>Tags</th>
                  <td>
                  </td>
                </tr>
                <tr>
                  <th>Notes</th>
                  <td><Form.Control></Form.Control>{props.report.notes}</td>
                </tr>
                </tbody>
              </Table>
            </Col>
            <Col>
              <h6>Original Tweet</h6>
              <Tweet tweetId={props.report.metadata.tweetID} options={{ theme: "dark" }}/>
            </Col>
          </>
          }
        </Row>
      </Form>
  )
}

export default ReportDetails;


