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
  Form
} from "react-bootstrap";
import StatsBar from '../../components/StatsBar';
import ConfirmModal from "../../components/ConfirmModal";
import {useParams} from "react-router-dom";
import {useMutation, useQuery, useQueryClient} from "react-query";
import {editGroup, getGroup, getGroupReports, getGroups} from "../../api/groups";
import {getSources} from "../../api/sources";
import {getTags} from "../../api/tags";
import {Group, Report, Reports, Source, Tag} from "../../objectTypes";
import {tagById, useQueryParse} from "../../helpers";
import ReportTable from "../../components/report/ReportTable";
import TagsTypeahead from "../../components/tag/TagsTypeahead";

const GroupDetails = () => {
  let { id } = useParams<{id: string}>();
  const query = useQueryParse();
  const queryClient = useQueryClient();
  const groupMutation = useMutation((group: Group) => { return editGroup(group) });
  const sourcesQuery = useQuery<Source[], AxiosError>("sources", getSources);
  const tagsQuery = useQuery<Tag[], AxiosError>("tags", getTags);
  //@ts-ignore
  const groupQuery = useQuery<Group, AxiosError>(["group", id], () => getGroup(id), {
    enabled: tagsQuery.isFetched,
    onSuccess: data => {
      if (tagsQuery.data) {
        const tags = data.smtcTags.map((tag) => {return tagById(tag, tagsQuery.data)}) || []
        //@ts-ignore TODO: Figure out how to type this so it doesn't throw an error this is because tagById could return null
        setQueryTags(tags);
      }
    }
  });
  const groupReportsQuery = useQuery<Reports, AxiosError>(
      ["reports", {groupId: id}], ()=> getGroupReports(id),
  );
  const [queryTags, setQueryTags] = useState<Tag[]>([]);
  const handleTagsBlur = () => {
    if (groupQuery.isFetched && groupQuery.data && queryTags) {
      // Shallow copy so we don't change the original query data
      let groupCopy = Object.assign({}, groupQuery.data);
      groupCopy.smtcTags = queryTags.map((tag)=> {return tag._id});
      groupMutation.mutate(groupCopy);
    }
  }

  return (
      <div className="mt-2">
        <Container fluid>
          <Row>
            <Col>
            </Col>
            <Col md={9}>
              <Container>
                <h3>Group details</h3>
                { groupQuery.isFetched &&
                <>
                  <Card className="mt-3">
                    <Card.Header>
                      <ButtonToolbar
                          className="justify-content-end"
                          aria-label="Toolbar with Button groups"
                      >
                        <ButtonGroup className={"me-2"}>
                        </ButtonGroup>
                        <ButtonGroup>
                          {groupQuery.data &&
                          <ConfirmModal type={"delete"} group={groupQuery.data} variant={"button"}></ConfirmModal>
                          }
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
                              {groupQuery.data.creator.username} at {(new Date(groupQuery.data.storedAt)).toLocaleString("en-US")}
                            </td>
                          </tr>
                          <tr>
                            <th>Last updated</th>
                            <td>{(new Date(groupQuery.data.updatedAt)).toLocaleString("en-US")}</td>
                          </tr>
                          <tr>
                            <th>Escalated</th>
                            <td>
                              {groupQuery.data.escalated
                                  ? <Form.Switch checked readOnly></Form.Switch>
                                  : <Form.Switch readOnly></Form.Switch>
                              }
                            </td>
                          </tr>
                          <tr>
                            <th>Closed</th>
                            <td>
                              {groupQuery.data.closed
                                  ? <Form.Switch checked readOnly></Form.Switch>
                                  : <Form.Switch readOnly></Form.Switch>
                              }
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
                                <Form.Control></Form.Control>
                              </Form>
                              {groupQuery.data.notes}
                            </td>
                          </tr>
                        </>
                        }
                        </tbody>
                      </Table>
                      <br/>
                    </Card.Body>
                  </Card>
                  <h3 className="mt-4">Reports</h3>
                  {groupReportsQuery.isFetched && groupReportsQuery.data && groupQuery.data && sourcesQuery.data && tagsQuery.data &&
                  <ReportTable
                      visibleReports={groupReportsQuery.data.results}
                      groups={[groupQuery.data]}
                      sources={sourcesQuery.data}
                      tags={tagsQuery.data}
                      variant={"group-details"}
                  />
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


