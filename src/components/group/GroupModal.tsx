import React, { useState } from 'react';
import {
  Button,
  Container,
  Modal,
  Dropdown,
  Row,
  Col,
  FormLabel,
  FormGroup,
  FormCheck,
  Form,
} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faEdit } from '@fortawesome/free-solid-svg-icons';
import { Group, GroupEditableData, User } from '../../objectTypes';
import { Formik, FormikValues, Field } from 'formik';
import * as Yup from 'yup';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { editGroup, newGroup } from '../../api/groups';
import { AxiosError } from 'axios';
import { getUsers } from '../../api/users';
import { VERACITY_OPTIONS } from '../../helpers';

interface IProps {
  group?: Group;
}

const groupEditSchema = Yup.object().shape({
  groupName: Yup.string().required('Group name required'),
  groupLocation: Yup.string(),
  groupEscalated: Yup.boolean(),
  groupClosed: Yup.boolean(),
  groupVeracity: Yup.string(),
  groupAssignedTo: Yup.array().of(Yup.string()),
  groupNotes: Yup.string(),
});

const veracityOptions = ['Confirmed True', 'Confirmed False', 'Unconfirmed'];

export default function GroupModal(props: IProps) {
  const [modalShow, setModalShow] = useState(false);
  const queryClient = useQueryClient();
  const usersQuery = useQuery<User[] | undefined, AxiosError>(
    'users',
    getUsers
  );
  const editGroupMutation = useMutation(
    (groupData: GroupEditableData) => {
      return editGroup(groupData);
    },
    {
      onSuccess: () => {
        setModalShow(false);
        queryClient.invalidateQueries('groups');
      },
    }
  );
  const newGroupMutation = useMutation(
    (groupData: GroupEditableData) => {
      return newGroup(groupData);
    },
    {
      onSuccess: () => {
        setModalShow(false);
        queryClient.invalidateQueries('groups');
      },
    }
  );
  const formValuesToGroup = (values: FormikValues) => {
    // This is because we can't use a null value as a select value.
    let assignedTo = values.groupAssignedTo;
    if (values.groupAssignedTo === '') {
      assignedTo = null;
    }
    if (props.group) {
      return {
        title: values.groupName,
        notes: values.groupNotes,
        veracity: values.groupVeracity,
        closed: values.groupClosed,
        assignedTo: assignedTo,
        locationName: values.groupLocation,
        public: values.groupPublic,
        escalated: values.groupEscalated,
        _id: props.group._id,
      };
    } else {
      return {
        title: values.groupName,
        notes: values.groupNotes,
        veracity: values.groupVeracity,
        closed: values.groupClosed,
        assignedTo: assignedTo,
        locationName: values.groupLocation,
        public: values.groupPublic,
        escalated: values.groupEscalated,
      };
    }
  };

  return (
    <>
      {props.group && (
        <Dropdown.Item onClick={() => setModalShow(true)}>
          {' '}
          <FontAwesomeIcon icon={faEdit} /> Edit
        </Dropdown.Item>
      )}
      {!props.group && (
        <Button variant='primary' onClick={() => setModalShow(true)} size='sm'>
          <FontAwesomeIcon
            icon={faPlusCircle}
            className={'me-1'}
          ></FontAwesomeIcon>
          <span> Create group </span>
        </Button>
      )}
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        backdrop='static'
        keyboard={false}
      >
        <Formik
          initialValues={{
            groupName: props.group ? props.group.title : '',
            groupVeracity: props.group
              ? props.group.veracity
              : VERACITY_OPTIONS[0],
            groupClosed: props.group ? props.group.closed : false,
            groupEscalated: props.group ? props.group.escalated : false,
            groupLocation: props.group ? props.group.locationName : '',
            groupAssignedTo: props.group
              ? props.group.assignedTo?.map((user) => user._id)
              : '',
            groupNotes: props.group ? props.group.notes : '',
          }}
          validationSchema={groupEditSchema}
          onSubmit={(values, { setSubmitting, resetForm }) => {
            if (props.group) {
              editGroupMutation.mutate(formValuesToGroup(values));
            } else {
              newGroupMutation.mutate(formValuesToGroup(values));
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            handleBlur,
            isSubmitting,
          }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Modal.Header closeButton>
                <Modal.Title>
                  {props.group ? 'Edit Group' : 'New Group'}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Container>
                  <FormGroup controlId='formUsername' className={'mb-3'}>
                    <FormLabel>Name</FormLabel>
                    <Form.Control
                      type='text'
                      className='form-control'
                      name='groupName'
                      value={values.groupName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.groupName && !!errors.groupName}
                    />
                    <Form.Control.Feedback type='invalid'>
                      {errors.groupName}
                    </Form.Control.Feedback>
                  </FormGroup>
                  <FormGroup controlId='formUserEmail' className={'mb-3'}>
                    <FormLabel>Location</FormLabel>
                    <Form.Control
                      type='text'
                      className='form-control'
                      name='groupLocation'
                      value={values.groupLocation}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={
                        touched.groupLocation && !!errors.groupLocation
                      }
                    />
                    <Form.Control.Feedback type='invalid'>
                      {errors.groupLocation}
                    </Form.Control.Feedback>
                  </FormGroup>
                  <Row>
                    <Col md>
                      <FormGroup
                        controlId='formGroupEscalated'
                        className={'mb-3'}
                      >
                        <FormCheck
                          checked={values.groupEscalated}
                          type='switch'
                          label='Escalated'
                          onChange={handleChange}
                          name='groupEscalated'
                        />
                      </FormGroup>
                    </Col>
                    <Col md>
                      <FormGroup controlId='formGroupClosed' className={'mb-3'}>
                        <FormCheck
                          checked={values.groupClosed}
                          type='switch'
                          label='Closed'
                          onChange={handleChange}
                          name='groupClosed'
                        />
                      </FormGroup>
                    </Col>
                  </Row>
                  <FormGroup controlId='formUserRole' className={'mb-3'}>
                    <FormLabel>Veracity</FormLabel>
                    <Form.Control
                      as={'select'}
                      name='groupVeracity'
                      className='form-select'
                      value={values.groupVeracity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={
                        touched.groupVeracity && !!errors.groupVeracity
                      }
                    >
                      {veracityOptions.map((option) => {
                        return <option key={option}>{option}</option>;
                      })}
                    </Form.Control>
                  </FormGroup>
                  <FormGroup controlId='formUserRole' className={'mb-3'}>
                    <FormLabel>Assigned to</FormLabel>
                    <Form.Control
                      as={'select'}
                      name='groupAssignedTo'
                      className='form-select'
                      value={values.groupAssignedTo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      multiple={true}
                      isInvalid={
                        touched.groupAssignedTo && !!errors.groupAssignedTo
                      }
                    >
                      {/* <option key='none' value={''}>
                        None
                      </option> */}
                      {usersQuery.isSuccess &&
                        usersQuery.data &&
                        usersQuery.data.map((user) => {
                          return (
                            <option key={user._id} value={user._id}>
                              {user.username}
                            </option>
                          );
                        })}
                    </Form.Control>
                  </FormGroup>
                  <FormGroup controlId='formGroupNotes' className={'mb-3'}>
                    <FormLabel>Notes</FormLabel>
                    <Form.Control
                      as={'textarea'}
                      placeholder={'Write notes here.'}
                      style={{ height: '100px' }}
                      name='groupNotes'
                      className='form-control'
                      value={values.groupNotes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      isInvalid={touched.groupNotes && !!errors.groupNotes}
                    />
                    <Form.Control.Feedback type='invalid'>
                      {errors.groupNotes}
                    </Form.Control.Feedback>
                  </FormGroup>
                </Container>
              </Modal.Body>
              <Modal.Footer>
                <Button variant='secondary' onClick={() => setModalShow(false)}>
                  Cancel
                </Button>
                <Button variant='primary' type='submit' disabled={isSubmitting}>
                  Save
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal>
    </>
  );
}
