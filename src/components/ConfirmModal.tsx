import {
  Alert,
  Button,
  Container,
  Dropdown,
  Form,
  Modal,
  Nav,
} from 'react-bootstrap';
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt, faTrash } from '@fortawesome/free-solid-svg-icons';
import { Group, Source, Tag, User, Credential } from '../objectTypes';
import { useMutation, useQueryClient } from 'react-query';
import { deleteUser } from '../api/users';
import { deleteTag } from '../api/tags';
import { deleteGroup } from '../api/groups';
import { deleteSource } from '../api/sources';
import { deleteCredential } from '../api/credentials';
import { logOut } from '../api/session';
import { useNavigate } from 'react-router-dom';
import { AxiosError } from 'axios';

// Should have more obsticles to deleting credentials and sources.
interface IProps {
  type: 'cancel' | 'delete' | 'logout';
  //TODO: I want to make variant into "as" as bootstrap react uses. This is more transparent.
  variant: 'button' | 'dropdown' | 'icon';
  tag?: Tag;
  group?: Group;
  user?: User;
  source?: Source;
  credential?: Credential;
  size?: 'sm' | 'lg';
}

export default function ConfirmModal(props: IProps) {
  const [modalShow, setModalShow] = useState(false);
  const [alertMessage, setAlertMessage] = useState({
    header: '',
    body: '',
  });
  const [alertShow, setAlertShow] = useState(false);
  const queryClient = useQueryClient();
  let navigate = useNavigate();
  const deleteTagMutation = useMutation(
    'tags',
    (tag: Tag) => {
      return deleteTag(tag);
    },
    {
      onSuccess: () => {
        setModalShow(false);
        queryClient.invalidateQueries('tags');
      },
      onError: (err: AxiosError) => {
        if (err.response) {
          setAlertMessage({
            header: String(err.response.status),
            body: err.response.data,
          });
        }
        setAlertShow(true);
      },
    }
  );
  const deleteGroupMutation = useMutation(
    (group: Group) => {
      return deleteGroup(group);
    },
    {
      onSuccess: () => {
        setModalShow(false);
        queryClient.invalidateQueries('groups');
      },
      onError: (err: AxiosError) => {
        if (err.response) {
          setAlertMessage({
            header: String(err.response.status),
            body: err.response.data,
          });
        }
        setAlertShow(true);
      },
    }
  );
  const deleteUserMutation = useMutation(
    (user: User) => {
      return deleteUser(user);
    },
    {
      onSuccess: () => {
        setModalShow(false);
        queryClient.invalidateQueries('users');
      },
      onError: (err: AxiosError) => {
        if (err.response) {
          setAlertMessage({
            header: String(err.response.status),
            body: err.response.data,
          });
        }
        setAlertShow(true);
      },
    }
  );
  const deleteSourceMutation = useMutation(
    (source: Source) => {
      return deleteSource(source);
    },
    {
      onSuccess: () => {
        setModalShow(false);
        queryClient.invalidateQueries('sources');
      },
      onError: (err: AxiosError) => {
        if (err.response) {
          setAlertMessage({
            header: String(err.response.status),
            body: err.response.data,
          });
        }
        setAlertShow(true);
      },
    }
  );
  const deleteCredentialMutation = useMutation(
    (credential: Credential) => {
      return deleteCredential(credential);
    },
    {
      onSuccess: () => {
        setModalShow(false);
        queryClient.invalidateQueries('credentials');
      },
      onError: (err: AxiosError) => {
        if (err.response) {
          setAlertMessage({
            header: String(err.response.status),
            body: err.response.data,
          });
        }
        setAlertShow(true);
      },
    }
  );
  const logOutMutation = useMutation(logOut, {
    onSuccess: (data) => {
      setModalShow(false);
      console.log('hello');
      queryClient.invalidateQueries('session');
      navigate('/login');
    },
    onError: (err: AxiosError) => {
      if (err.response) {
        setAlertMessage({
          header: String(err.response.status),
          body: err.response.data,
        });
      }
      setAlertShow(true);
    },
  });

  const handleSubmit = () => {
    // Pick which api endpoint to use
    if (props.type === 'delete') {
      if (props.tag) {
        deleteTagMutation.mutate(props.tag);
      }
      if (props.group) {
        deleteGroupMutation.mutate(props.group);
      }
      if (props.user) {
        deleteUserMutation.mutate(props.user);
      }
      if (props.source) {
        deleteSourceMutation.mutate(props.source);
      }
      if (props.credential) {
        deleteCredentialMutation.mutate(props.credential);
      }
    } else if (props.type === 'logout') {
      logOutMutation.mutate();
    } else {
    }
  };

  if (props.type === 'delete') {
    return (
      <>
        {props.variant === 'dropdown' && (
          <Dropdown.Item onClick={() => setModalShow(true)}>
            <FontAwesomeIcon icon={faTrash} className='me-2' />
            Delete
          </Dropdown.Item>
        )}
        {props.variant === 'button' && (
          <Button
            type={'button'}
            variant={'danger'}
            onClick={() => setModalShow(true)}
            size={props.size ? props.size : undefined}
          >
            <FontAwesomeIcon icon={faTrash} className='me-2' /> Delete
          </Button>
        )}
        {props.variant === 'icon' && (
          <Button
            variant='light'
            onClick={() => setModalShow(true)}
            size={props.size ? props.size : undefined}
          >
            <FontAwesomeIcon icon={faTrash} />
          </Button>
        )}
        <Modal
          show={modalShow}
          onHide={() => setModalShow(false)}
          backdrop='static'
          keyboard={false}
        >
          <Modal.Header closeButton>
            {props.tag && <Modal.Title>Delete tag</Modal.Title>}
            {props.group && <Modal.Title>Delete group</Modal.Title>}
            {props.user && <Modal.Title>Delete user</Modal.Title>}
            {props.credential && <Modal.Title>Delete credential</Modal.Title>}
            {props.source && <Modal.Title>Delete source</Modal.Title>}
          </Modal.Header>
          <Modal.Body>
            <Alert variant={'danger'} show={alertShow}>
              <Alert.Heading>{alertMessage.header}</Alert.Heading>
              <p></p>
            </Alert>
            {props.tag && props.tag.name && (
              <p>
                Are you sure you want to delete the tag: <b>{props.tag.name}</b>
                ?
              </p>
            )}
            {props.group && props.group.title && (
              <>
                <p>
                  Are you sure you want to delete the group:{' '}
                  <b>{props.group.title}</b>?
                </p>
                <p>
                  It contains <b>{props.group._reports.length}</b> reports
                </p>
              </>
            )}
            {props.user && props.user.username && (
              <p>
                Are you sure you want to delete the user:{' '}
                <b>{props.user.username}</b>?
              </p>
            )}
            {props.credential && props.credential.name && (
              <p>
                Are you sure you want to delete the credential:{' '}
                <b>{props.credential.name}</b>?
              </p>
            )}
            {props.source && props.source.nickname && (
              <p>
                Are you sure you want to delete the source:{' '}
                <b>{props.source.nickname}</b>?
              </p>
            )}
            <small className='text-muted'>This action cannot be undone.</small>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={() => setModalShow(false)}>
              Cancel
            </Button>
            <Button
              variant='primary'
              type='submit'
              onClick={handleSubmit}
              disabled={props.tag?.isBeingEdited}
            >
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  } else if (props.type === 'logout') {
    return (
      <>
        <Nav.Link
          eventKey='11'
          className='ps-2'
          onClick={() => setModalShow(true)}
        >
          <FontAwesomeIcon icon={faSignOutAlt} />
          <span> Switch users </span>
        </Nav.Link>
        <Modal
          show={modalShow}
          onHide={() => setModalShow(false)}
          backdrop='static'
          keyboard={false}
        >
          <Modal.Header closeButton>
            <Modal.Title>Confirm your log out</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container fluid>
              <p>Are you sure you want to log out?</p>
              <small className={'text-muted'}>
                You will have to log in again to use Aggie.
              </small>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={() => setModalShow(false)}>
              Cancel
            </Button>
            <Button variant='primary' type='submit' onClick={handleSubmit}>
              Confirm
            </Button>
          </Modal.Footer>
        </Modal>
      </>
    );
  } else {
    return <div>You should not see this, let us know what happened.</div>;
  }
}
