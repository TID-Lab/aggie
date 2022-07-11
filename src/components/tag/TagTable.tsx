import * as React from 'react';
import { Table, Form } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Card, ButtonToolbar, Dropdown } from 'react-bootstrap';
import ConfirmModal from '../ConfirmModal';
import TagModal from './TagModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';
import EllipsisToggle from '../EllipsisToggle';
import { Tag } from '../../objectTypes';
import './TagTable.css';
import { stringToDate } from '../../helpers';
interface IProps {
  tags: Tag[] | [];
}

export default function TagTable(props: IProps) {
  let tagRows;
  //
  if (props.tags.length > 0) {
    tagRows = props.tags.map((tag: Tag) => (
      <tr key={tag._id}>
        <td className={'align-middle'}>
          <strong>{tag.name}</strong>
        </td>
        <td className={'align-middle td__creationInfo'}>
          {tag.user ? (
            <Link className={'td__userLink'} to={'/user/' + tag.user._id}>
              <span className={'creationInfo__user '}>{tag.user.username}</span>
            </Link>
          ) : (
            <span className={'creationInfo__user'}>Deleted user</span>
          )}

          <br />
          <span>{stringToDate(tag.storedAt).toLocaleTimeString()}</span>
          <br />
          <span>{stringToDate(tag.storedAt).toLocaleDateString()}</span>
        </td>
        <td className={'td__description'}>
          {tag.description ? <>{tag.description}</> : <></>}
        </td>
        <td className={'align-middle'}>
          {tag.isCommentTag ? (
            <Form.Check disabled type='switch' checked />
          ) : (
            <Form.Check disabled type='switch' />
          )}
        </td>
        <td className={'align-middle'}>
          <Dropdown className={'float-end'}>
            <Dropdown.Toggle as={EllipsisToggle} />
            <Dropdown.Menu variant={'dark'}>
              <TagModal tag={tag}></TagModal>
              <Dropdown.Divider />
              <ConfirmModal type='delete' variant='dropdown' tag={tag} />
            </Dropdown.Menu>
          </Dropdown>
        </td>
      </tr>
    ));
  } else {
    tagRows = (
      <tr>
        <td>No Tags Found.</td>
        <td />
        <td />
        <td />
        <td />
        <td />
      </tr>
    );
  }

  return (
    <Table hover className={'m-0'}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Details</th>
          <th>Description</th>
          <th>Comments</th>
          <th></th>
        </tr>
      </thead>
      <tbody>{tagRows}</tbody>
    </Table>
  );
}
