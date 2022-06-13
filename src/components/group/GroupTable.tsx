import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Linkify from 'linkify-react';
import {
  Card,
  Pagination,
  ButtonToolbar,
  Form,
  ButtonGroup,
  Dropdown,
  Image,
  Container,
  Table,
  Button,
  Placeholder,
  InputGroup,
} from 'react-bootstrap';
import ConfirmModal from '../ConfirmModal';
import EllipsisToggle from '../EllipsisToggle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCheckCircle,
  faEllipsisV,
  faFilter,
  faPlusCircle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons';
import GroupModal from './GroupModal';
import { stringToDate, tagById, tagsById } from '../../helpers';
import {
  Group,
  Groups,
  GroupSearchState,
  Source,
  Tag,
  User,
} from '../../objectTypes';
import TagsTypeahead from '../tag/TagsTypeahead';
import { useMutation, useQuery } from 'react-query';
import { editGroup, getGroups } from '../../api/groups';
import styles from './GroupTable.module.css';
import VeracityIndication from '../VeracityIndication';
import EscalatedIndication from '../EscalatedIndication';
import { AxiosError } from 'axios';
import { LoadingPagination } from '../AggiePagination';

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
      newSelectedGroups = new Set(
        props.visibleGroups.map((group) => group._id)
      );
    } else {
      newSelectedGroups = new Set<string>();
    }
    setSelectedGroups(newSelectedGroups);
  };
  return (
    <Table bordered hover size='sm' className={'m-0'}>
      <thead>
        <tr>
          <th>
            <Form>
              <Form.Check
                type='checkbox'
                id={'select-all'}
                onChange={handleAllSelectChange}
                checked={selectedGroups.size > 0}
              />
            </Form>
          </th>
          <th>Group Info</th>
          <th>Location</th>
          <th>Created</th>
          <th>Notes</th>
          <th>Assignee</th>
          <th>Tags</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {props.visibleGroups &&
          props.visibleGroups.map((group) => {
            return (
              <GroupRow
                group={group}
                sources={props.sources}
                variant={'table'}
                tags={props.tags}
                users={props.users}
                key={group._id}
                selectedGroups={selectedGroups}
                setSelectedGroups={setSelectedGroups}
              />
            );
          })}
        {props.visibleGroups && props.visibleGroups.length === 0 && (
          <tr key='empty'>
            <td>No groups found.</td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        )}
      </tbody>
    </Table>
  );
}

interface GroupRowIProps {
  group: Group | null;
  tags: Tag[];
  users: User[] | undefined;
  sources: Source[] | [];
  variant: 'modal' | 'table';
  setSelectedGroups?: Dispatch<SetStateAction<Set<string>>>;
  selectedGroups?: Set<string>;
  onClick?: React.MouseEventHandler<HTMLTableRowElement>;
  className?: string;
  selected?: boolean;
}

export function GroupRow(props: GroupRowIProps) {
  const groupMutation = useMutation((group: Group) => {
    return editGroup(group);
  });
  const [queryTags, setQueryTags] = useState<Tag[]>(
    //@ts-ignore TODO: Figure out how to type this so it doesn't throw an error this is because tagById could return null
    props.group.smtcTags.map((tag) => {
      return tagById(tag, props.tags);
    })
  );

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
  };
  const handleTagsBlur = () => {
    if (props.group && queryTags) {
      props.group.smtcTags = queryTags.map((tag) => {
        return tag._id;
      });
      groupMutation.mutate(props.group);
    }
  };

  if (props.group) {
    switch (props.variant) {
      case 'table':
        return (
          <tr key={props.group._id} className={props.className}>
            <td>
              <Form>
                <Form.Check
                  type='checkbox'
                  id={props.group._id}
                  onChange={handleSelected}
                  checked={props.selectedGroups?.has(props.group._id)}
                />
              </Form>
            </td>
            <td className={styles.td__groupInfo}>
              <VeracityIndication
                veracity={props.group.veracity}
                id={props.group._id}
                variant={'table'}
              />
              <EscalatedIndication
                escalated={props.group.escalated}
                id={props.group._id}
                variant={'table'}
              />
              <Link
                to={'/group/' + props.group._id}
                className={styles.group__name + ' me-1'}
              >
                {props.group.title}
              </Link>
              <br />
              <span>
                {props.group._reports.length === 1
                  ? props.group._reports.length + ' report'
                  : props.group._reports.length + ' reports'}
              </span>
              <br />
              <span>ID: {props.group.idnum}</span>
            </td>
            <td className={styles.td__location + ' text-break'}>
              <Linkify options={{ target: '_blank' }}>
                {props.group.locationName}
              </Linkify>
            </td>
            <td className={styles.td__creationInfo}>
              <span className={styles.creationInfo__user}>
                {props.group.creator
                  ? props.group.creator.username
                  : 'Deleted user'}
              </span>
              <br />
              <span>
                {stringToDate(props.group.storedAt).toLocaleTimeString()}
              </span>
              <br />
              <span>
                {stringToDate(props.group.storedAt).toLocaleDateString()}
              </span>
            </td>
            {props.group.notes ? (
              <td className={styles.td__notes}>
                <Form.Control
                  as='textarea'
                  rows={4}
                  disabled
                  defaultValue={props.group.notes}
                />
              </td>
            ) : (
              <td className={styles.td__notes}>
                <Form.Control as='textarea' rows={4} disabled />
              </td>
            )}
            {props.group.assignedTo ? (
              <td className={styles.td__assignedTo}>
                {props.group.assignedTo.map((user) => (
                  <Link
                    key={user._id}
                    to={'/user/' + user._id}
                    style={{ marginRight: '0.25em' }}
                  >
                    {user.username ? user.username : 'Deleted user'}
                  </Link>
                ))}
              </td>
            ) : (
              <td className={styles.td__assignedTo}></td>
            )}
            <td className={styles.td__tags}>
              {props.tags && props.group && props.group._id && queryTags && (
                <TagsTypeahead
                  id={props.group._id}
                  options={props.tags}
                  selected={queryTags}
                  onChange={setQueryTags}
                  onBlur={handleTagsBlur}
                  variant={'table'}
                />
              )}
            </td>
            <td style={{ width: 32 }}>
              <Dropdown className={'float-end'}>
                <Dropdown.Toggle as={EllipsisToggle} />
                <Dropdown.Menu variant={'dark'}>
                  <GroupModal group={props.group} />
                  <Dropdown.Divider />
                  <ConfirmModal
                    type={'delete'}
                    variant='dropdown'
                    group={props.group}
                  />
                </Dropdown.Menu>
              </Dropdown>
            </td>
          </tr>
        );
        break;
      case 'modal':
        return (
          <tr
            key={props.group._id}
            className={'group__select ' + props.className}
            onClick={props.onClick}
          >
            <td className={'align-middle'}>
              <div className='d-flex justify-content-center'>
                {props.selected && (
                  <Form.Check
                    type='radio'
                    id={props.group._id}
                    checked
                    readOnly
                  />
                )}
                {!props.selected && (
                  <Form.Check type='radio' id={props.group._id} readOnly />
                )}
              </div>
            </td>
            <td className={'td__groupInfo'}>
              <VeracityIndication
                veracity={props.group.veracity}
                id={props.group._id}
                variant={'table'}
              />
              <EscalatedIndication
                escalated={props.group.escalated}
                id={props.group._id}
                variant={'table'}
              />
              <Link
                to={'/group/' + props.group._id}
                className={'me-1 title__link'}
              >
                {props.group.title}
              </Link>
              <br />
              <span>
                {props.group._reports.length === 1
                  ? props.group._reports.length + ' report'
                  : props.group._reports.length + ' reports'}
              </span>
              <br />
              <span>ID: {props.group.idnum}</span>
            </td>
            <td className='text-break td__location'>
              <Linkify options={{ target: '_blank' }}>
                {props.group.locationName}
              </Linkify>
            </td>
            <td className={'td__creationInfo'}>
              <span className={'creationInfo__user'}>
                {props.group.creator
                  ? props.group.creator.username
                  : 'Deleted user'}
              </span>
              <br />
              <span>
                {stringToDate(props.group.storedAt).toLocaleTimeString()}
              </span>
              <br />
              <span>
                {stringToDate(props.group.storedAt).toLocaleDateString()}
              </span>
            </td>
            {props.group.notes ? (
              <td className={'td__notes'}>
                <Form.Control
                  as='textarea'
                  rows={4}
                  disabled
                  defaultValue={props.group.notes}
                />
              </td>
            ) : (
              <td></td>
            )}
            {props.group.assignedTo ? (
              <td>
                {props.group.assignedTo
                  .map((user) =>
                    user.username ? user.username : 'Deleted user'
                  )
                  .join(', ')}
              </td>
            ) : (
              <td></td>
            )}
            <td></td>
          </tr>
        );
        break;
    }
  } else {
    return (
      <tr key={'noGroups'}>
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
    );
  }
}

export const LoadingGroupTable = () => {
  const placeHolderValues = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  return (
    <Table bordered size='sm' hover>
      <thead>
        <tr>
          <th>
            <Form>
              <Form.Check type='checkbox' id={'select-all'} />
            </Form>
          </th>
          <th>Group Info</th>
          <th>Location</th>
          <th>Created</th>
          <th>Notes</th>
          <th>Assignee</th>
          <th>Tags</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {placeHolderValues.map((value) => {
          return (
            <tr key={value}>
              <td>
                <Form>
                  <Form.Check type='checkbox' disabled />
                </Form>
              </td>
              <td className={styles.td__groupInfo}>
                <Placeholder animation='glow'>
                  <Placeholder xs={6}></Placeholder>
                  <br />
                  <small>
                    <Placeholder animation='glow'>
                      <Placeholder xs={3}></Placeholder>
                    </Placeholder>{' '}
                    reports
                  </small>
                </Placeholder>
              </td>
              <td className={styles.td__location}>
                <Placeholder animation='glow'>
                  <Placeholder xs={12}></Placeholder>
                </Placeholder>
              </td>
              <td className={styles.td__creationInfo + ' text-break'}>
                <Placeholder animation='glow'>
                  <Placeholder xs={12}></Placeholder>
                </Placeholder>
              </td>
              <td className={styles.td__notes}>
                <Placeholder animation='glow'>
                  <Placeholder xs={12}></Placeholder>
                  <Placeholder xs={12}></Placeholder>
                </Placeholder>
              </td>
              <td className={styles.td__assignedTo}>
                <Placeholder animation='glow'>
                  <Placeholder xs={8}></Placeholder>
                </Placeholder>
              </td>
              <td className={styles.td__tags}>
                <Form.Control placeholder='Edit tags' disabled />
              </td>
              <td style={{ width: 32 }}>
                <Button variant='light'>
                  <FontAwesomeIcon icon={faEllipsisV}></FontAwesomeIcon>
                </Button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};
