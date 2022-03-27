import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import { Link } from 'react-router-dom';
import Linkify from 'linkify-react';
import {Card, Pagination, ButtonToolbar, Form, ButtonGroup, Dropdown, Image, Container, Table} from "react-bootstrap";
import ConfirmModal from "../ConfirmModal";
import EllipsisToggle from "../EllipsisToggle";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircle} from "@fortawesome/free-regular-svg-icons";
import {faCheckCircle, faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import GroupModal from "./GroupModal";
import {
  stringToDate, tagById,
  tagsById
} from "../../helpers";
import {Group, GroupEditableData, Report, Source, Tag, User} from "../../objectTypes";
import TagsTypeahead from "../tag/TagsTypeahead";
import {useMutation} from "react-query";
import {editGroup} from "../../api/groups";

interface IProps {
  visibleGroups: Group[] | [];
  sources: Source[] | [];
  users: User[] | [];
  tags: Tag[] | [];
}

export default function GroupTable(props: IProps) {
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const handleAllSelectChange = () => {
    let newSelectedGroups;
    if (selectedGroups.size === 0) {
      newSelectedGroups = new Set(props.visibleGroups.map(group => group._id));
    } else {
      newSelectedGroups = new Set<string>();
    }
    setSelectedGroups(newSelectedGroups);
  }
  return (
    <Card>
      <Card.Header>
        <ButtonToolbar
            className="justify-content-end"
            aria-label="Toolbar with Button groups"
        >
          <ButtonGroup className={"me-2"}>
            <GroupModal users={props.users}/>
          </ButtonGroup>
        </ButtonToolbar>
      </Card.Header>
      <Table striped bordered hover>
        <thead>
          <tr>
            <th>
              <Form>
              <Form.Check
                  type="checkbox"
                  id={"select-all"}
                  onChange={handleAllSelectChange}
                  checked={selectedGroups.size > 0}
              />
              </Form>
            </th>
            <th>#</th>
            <th>Title</th>
            <th>Location</th>
            <th>Notes</th>
            <th>Assigned To</th>
            <th>Creation Info</th>
            <th>Tags</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {props.visibleGroups && props.visibleGroups.map((group) => {
            return <GroupRow
                group={group}
                sources={props.sources}
                variant={"table"}
                tags={props.tags}
                users={props.users}
                key={group._id}
                selectedGroups={selectedGroups}
                setSelectedGroups={setSelectedGroups}
            />
          })
          }
        </tbody>
      </Table>
      <Card.Footer className="justify-center">
        <div className="d-flex justify-content-center">
          <Pagination size={'sm'}>
            <Pagination.First />
            <Pagination.Prev />
            <Pagination.Item>{1}</Pagination.Item>
            <Pagination.Ellipsis />
            <Pagination.Item>{10}</Pagination.Item>
            <Pagination.Item>{11}</Pagination.Item>
            <Pagination.Item active>{12}</Pagination.Item>
            <Pagination.Item>{13}</Pagination.Item>
            <Pagination.Item disabled>{14}</Pagination.Item>
            <Pagination.Ellipsis />
            <Pagination.Item>{20}</Pagination.Item>
            <Pagination.Next />
            <Pagination.Last />
          </Pagination>
        </div>
      </Card.Footer>
    </Card>
  );
}

interface GroupRowIProps {
  group: Group | null,
  tags: Tag[],
  users: User[] | [],
  sources: Source[] | [],
  variant: "modal" | "table"
  setSelectedGroups?: Dispatch<SetStateAction<Set<string>>>,
  selectedGroups?: Set<string>,
}

export function GroupRow(props: GroupRowIProps) {
  const groupMutation = useMutation((group: Group) => { return editGroup(group) });
  //@ts-ignore TODO: Figure out how to type this so it doesn't throw an error this is because tagById could return null
  const [queryTags, setQueryTags] = useState<Tag[]>(props.group.smtcTags.map((tag) => {return tagById(tag, props.tags)}));

  const handleSelected = () => {
    if (props.setSelectedGroups && props.selectedGroups && props.group?._id) {
      let newSelectedGroups = new Set(props.selectedGroups);
      if (newSelectedGroups.has(props.group._id)) {
        newSelectedGroups.delete(props.group._id);
      } else {
        newSelectedGroups.add(props.group._id);
      }
      props.setSelectedGroups(newSelectedGroups);
    }
  }
  const handleTagsBlur = () => {
    if (props.group && queryTags) {
      props.group.smtcTags = queryTags.map((tag)=> {return tag._id});
      groupMutation.mutate(props.group);
    }
  }

  if (props.group) {
    switch (props.variant) {
      case 'table':
        return (
            <tr key={props.group._id}>
              <td>
                <Form>
                  <Form.Check
                      type="checkbox"
                      id={props.group._id}
                      onChange={handleSelected}
                      checked={props.selectedGroups?.has(props.group._id)}/>
                </Form>
              </td>
              <td>{props.group.idnum}</td>
              <td>
                <Link to={"/group/" + props.group._id} className={"me-1"}>{props.group.title}</Link>
                {props.group.veracity === "Confirmed true" &&
                <FontAwesomeIcon icon={faCheckCircle} className={"text-primary"}/>
                }
                {props.group.veracity === "Confirmed false" &&
                <FontAwesomeIcon icon={faTimesCircle} className={"text-secondary"}/>
                }
                {props.group.veracity === "Unconfirmed" &&
                <FontAwesomeIcon icon={faCircle}/>
                }
                <br/>
                <small>{props.group.totalReports} reports</small>
              </td>
              <td className="text-break">
                <Linkify options={{target: '_blank'}}>{props.group.locationName}</Linkify>
              </td>
              {props.group.notes
                  ? <td>{props.group.notes}</td>
                  : <td></td>
              }
              {props.group.assignedTo
                  ? <td>{props.group.assignedTo.username}</td>
                  : <td></td>
              }
              <td>
                {props.group.creator.username}
                <br/>
                <small>{stringToDate(props.group.updatedAt).toLocaleString("en-US")}</small>
              </td>
              <td>
                {props.tags && props.group && props.group._id &&
                <TagsTypeahead
                    id={props.group._id}
                    options={props.tags}
                    selected={queryTags}
                    onChange={setQueryTags}
                    onBlur={handleTagsBlur}
                    variant={"table"}
                />
                }
              </td>
              <td>
                <Dropdown>
                  <Dropdown.Toggle as={EllipsisToggle}/>
                  <Dropdown.Menu variant={"dark"}>
                    <GroupModal group={props.group} users={props.users}/>
                    <Dropdown.Divider/>
                    <ConfirmModal type={"delete"} variant="dropdown" group={props.group}/>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
        )
        break;
      case 'modal':
        return (
            <tr key={props.group._id}>
              <td>
                <Form>
                  <Form.Check
                      type="checkbox"
                      id={props.group._id}
                  />
                </Form>
              </td>
              <td>{props.group.idnum}</td>
              <td><Link to={"/group/" + props.group._id}>{props.group.title}</Link></td>
              <td className="text-break">
                <Linkify options={{target: '_blank'}}>{props.group.locationName}</Linkify>
              </td>
              {props.group.notes
                  ? <td>{props.group.notes}</td>
                  : <td></td>
              }
              {props.group.assignedTo
                  ? <td>{props.group.assignedTo.username}</td>
                  : <td></td>
              }
              <td>
                {props.group.creator.username}
                <br/>
                <small>{stringToDate(props.group.updatedAt).toLocaleString("en-US")}</small>
              </td>
              <td>
              </td>
              <td>
                <Dropdown>
                  <Dropdown.Toggle as={EllipsisToggle}/>
                  <Dropdown.Menu variant={"dark"}>
                    <GroupModal group={props.group} users={props.users}/>
                    <Dropdown.Divider/>
                    <ConfirmModal type={"delete"} variant="dropdown" group={props.group}/>
                  </Dropdown.Menu>
                </Dropdown>
              </td>
            </tr>
        )
        break;
    }
  } else {
    return (
        <tr key={"noGroups"}>
          <td>No groups found.</td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
    )
  }
}
