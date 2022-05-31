import {
  Button,
  Container,
  Dropdown,
  Modal,
  FormGroup,
  FormText,
  FormLabel,
  FormSelect,
} from 'react-bootstrap';
import React, { ChangeEvent, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faEdit } from '@fortawesome/free-solid-svg-icons';
import { capitalizeFirstLetter } from '../../helpers';
import * as Yup from 'yup';
import { Formik, Form, FormikValues } from 'formik';
import { Field } from 'formik';
import { Credential, MediaType, Source } from '../../objectTypes';
import { useMutation, useQueryClient } from 'react-query';
import { newSource, editSource } from '../../api/sources';

interface IProps {
  source?: Source;
  variant: 'button' | 'dropdown';
  credentials: Credential[];
}

const twitterFormSchema = Yup.object().shape({
  sourceNickname: Yup.string().required('Source name is a required field'),
  sourceKeywords: Yup.string().required(
    'Keywords are required to create a Twitter source'
  ),
  sourceCredentials: Yup.string().required(
    'A credential is required to create a source'
  ),
});

const CrowdTangleFormSchema = Yup.object().shape({
  sourceNickname: Yup.string().required('Source name is a required field'),
  sourceCredentials: Yup.string().required(
    'A credential is required to create a source'
  ),
});

const sourceFormSchema = Yup.object().shape({
  sourceNickname: Yup.string().required('Source nickname required'),
  sourceKeywords: Yup.string(),
  sourceTags: Yup.string(),
  sourceCredentials: Yup.string().required('Credentials required'),
  sourceURL: Yup.string(),
});

const mediaTypes = [
  'twitter',
  'instagram',
  'RSS',
  'elmo',
  'SMS GH',
  'facebook',
];
const mediaUrls = {
  twitter: 'https://twitter.com/',
  facebook: 'https://www.facebook.com/',
  instagram: 'https://www.instagram.com/',
};

export default function SourceModal(props: IProps) {
  const [sourceMediaType, setSourceMediaType] = useState<MediaType | string>(
    'twitter'
  ); // Default state of media type
  const [modalShow, setModalShow] = useState(false);
  const queryClient = useQueryClient();
  const newSourceMutation = useMutation(
    (sourceData: any) => {
      return newSource(sourceData);
    },
    {
      onSuccess: () => {
        setModalShow(false);
        queryClient.invalidateQueries('sources');
      },
    }
  );
  const editSourceMutation = useMutation(
    (sourceData: any) => {
      return editSource(sourceData);
    },
    {
      onSuccess: () => {
        setModalShow(false);
        queryClient.invalidateQueries('sources');
      },
    }
  );
  const formValuesToSource = (values: FormikValues) => {
    switch (sourceMediaType) {
      case 'twitter':
        return {
          credentials: values.sourceCredentials,
          keywords: values.sourceKeywords,
          media: sourceMediaType,
          nickname: values.sourceNickname,
          url: mediaUrls['twitter'],
        };
        break;
      case 'facebook':
        return {
          credentials: values.sourceCredentials,
          media: sourceMediaType,
          nickname: values.sourceNickname,
          url: mediaUrls['facebook'],
        };
      default:
        return {};
    }
  };
  const defaultCredential =
    props.credentials.find(
      (credential) => credential.type === sourceMediaType
    ) || null;
  const twitterFormJSX = (
    <Formik
      initialValues={{
        sourceNickname: props.source?.nickname || '',
        sourceMedia: props.source?.media || '',
        sourceKeywords: props.source?.keywords || '',
        sourceTags: props.source?.tags || '',
        sourceCredentials:
          props.source?.credentials._id || defaultCredential?._id,
        sourceURL: props.source?.url || '',
      }}
      validationSchema={twitterFormSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        if (props.source) {
          editSourceMutation.mutate(formValuesToSource(values));
        } else {
          newSourceMutation.mutate(formValuesToSource(values));
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
        /* and other goodies */
      }) => (
        <Form noValidate onSubmit={handleSubmit}>
          <Modal.Header closeButton>
            <Modal.Title>Create source</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <FormGroup controlId='sourceMedia' className='mb-3'>
                <FormLabel>Media</FormLabel>
                <FormSelect
                  value={sourceMediaType}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setSourceMediaType(e.target.value);
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                >
                  {mediaTypes.map((mediaType) => {
                    return (
                      <option key={mediaType} value={mediaType}>
                        {capitalizeFirstLetter(mediaType)}
                      </option>
                    );
                  })}
                </FormSelect>
              </FormGroup>
              <FormGroup controlId='sourceNickname' className={'mb-3'}>
                <FormLabel>Name</FormLabel>
                <Field
                  type='text'
                  name='sourceNickname'
                  placeholder='Enter name'
                  className={
                    errors.sourceNickname
                      ? 'form-control is-invalid'
                      : 'form-control'
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.sourceNickname && (
                  <div
                    className='invalid-feedback'
                    style={{ display: 'block' }}
                  >
                    {errors.sourceNickname}
                  </div>
                )}
              </FormGroup>
              <FormGroup controlId='sourceKeywords' className={'mb-3'}>
                <FormLabel>Keywords</FormLabel>
                <Field
                  type='text'
                  name='sourceKeywords'
                  placeholder='Enter keywords'
                  className={
                    errors.sourceKeywords
                      ? 'form-control is-invalid'
                      : 'form-control'
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.sourceKeywords && (
                  <div
                    className='invalid-feedback'
                    style={{ display: 'block' }}
                  >
                    {errors.sourceKeywords}
                  </div>
                )}
                <FormText muted>
                  Separated by commas, e.g. <i>banana, apple, mango</i>. Click{' '}
                  <a
                    href={
                      'https://dev.twitter.com/streaming/overview/request-parameters#track'
                    }
                  >
                    here
                  </a>{' '}
                  for details on how this is used to find tweets.
                </FormText>
              </FormGroup>
              <FormGroup controlId='sourceCredentials' className='mb-3'>
                <FormLabel>Credentials</FormLabel>
                <Field
                  as='select'
                  name='sourceCredentials'
                  id='sourceCredentials'
                  className={
                    errors.sourceCredentials
                      ? 'form-control is-invalid'
                      : 'form-control'
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  {props.credentials.map((cred: Credential) => {
                    if (cred.type === 'twitter') {
                      return (
                        <option key={cred._id} value={cred._id}>
                          {cred.name}
                        </option>
                      );
                    }
                  })}
                </Field>
                {errors.sourceCredentials && (
                  <div
                    className='invalid-feedback'
                    style={{ display: 'block' }}
                  >
                    {errors.sourceCredentials}
                  </div>
                )}
                <FormText muted>
                  Select which credentials will be used for API calls.
                </FormText>
              </FormGroup>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={() => setModalShow(false)}>
              Cancel
            </Button>
            <Button variant='primary' type='submit' disabled={isSubmitting}>
              Submit
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Formik>
  );
  const crowdtangleFormJSX = (
    <Formik
      initialValues={{
        sourceNickname: props.source?.nickname || '',
        sourceCredentials:
          props.source?.credentials._id || defaultCredential?._id,
      }}
      validationSchema={CrowdTangleFormSchema}
      onSubmit={async (values, { setSubmitting, resetForm }) => {
        if (props.source) {
          editSourceMutation.mutate(formValuesToSource(values));
        } else {
          newSourceMutation.mutate(formValuesToSource(values));
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
        /* and other goodies */
      }) => (
        <Form>
          <Modal.Header closeButton>
            <Modal.Title>Create source</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Container>
              <FormGroup controlId='sourceMedia' className='mb-3'>
                <FormLabel>Media</FormLabel>
                <FormSelect
                  value={sourceMediaType}
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                    setSourceMediaType(e.target.value);
                    handleChange(e);
                  }}
                  onBlur={handleBlur}
                >
                  {mediaTypes.map((mediaType) => {
                    return (
                      <option key={mediaType} value={mediaType}>
                        {capitalizeFirstLetter(mediaType)}
                      </option>
                    );
                  })}
                </FormSelect>
              </FormGroup>
              <FormGroup controlId='sourceNickname' className={'mb-3'}>
                <FormLabel>Name</FormLabel>
                <Field
                  name={'sourceNickname'}
                  type='text'
                  className={
                    errors.sourceNickname
                      ? 'form-control is-invalid'
                      : 'form-control'
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                />
                {errors.sourceNickname && (
                  <div
                    className='invalid-feedback'
                    style={{ display: 'block' }}
                  >
                    {errors.sourceNickname}
                  </div>
                )}
                <FormText muted>
                  Providing a name keeps track of which source a report is from.
                </FormText>
              </FormGroup>
              <FormGroup className='mb-3'>
                <FormLabel>Credentials</FormLabel>
                <Field
                  as='select'
                  name='sourceCredentials'
                  className={
                    errors.sourceCredentials
                      ? 'form-control is-invalid'
                      : 'form-control'
                  }
                  onChange={handleChange}
                  onBlur={handleBlur}
                >
                  <option value='none'> Select credential </option>
                  {props.credentials.map((cred: Credential) => {
                    if (cred.type === 'crowdtangle') {
                      return (
                        <option key={cred._id} value={cred._id}>
                          {cred.name}
                        </option>
                      );
                    }
                  })}
                </Field>
                {errors.sourceCredentials && (
                  <div
                    className='invalid-feedback'
                    style={{ display: 'block' }}
                  >
                    {errors.sourceCredentials}
                  </div>
                )}
                <FormText muted>
                  Select which API credentials will be used for API calls. Find
                  more info on the Crowdtangle API{' '}
                  <a href='https://help.crowdtangle.com/en/articles/1189612-crowdtangle-api'>
                    here
                  </a>
                  .
                </FormText>
              </FormGroup>
            </Container>
          </Modal.Body>
          <Modal.Footer>
            <Button variant='secondary' onClick={() => setModalShow(false)}>
              Cancel
            </Button>
            <Button variant='primary' type='submit' disabled={isSubmitting}>
              Submit
            </Button>
          </Modal.Footer>
        </Form>
      )}
    </Formik>
  );

  return (
    <>
      {props.source && props.variant === 'dropdown' && (
        <Dropdown.Item onClick={() => setModalShow(true)}>
          <FontAwesomeIcon icon={faEdit} /> Edit
        </Dropdown.Item>
      )}
      {props.source && props.variant === 'button' && (
        <Button variant='secondary' onClick={() => setModalShow(true)}>
          <FontAwesomeIcon icon={faEdit} /> Edit
        </Button>
      )}
      {!props.source && (
        <Button variant={'primary'} onClick={() => setModalShow(true)}>
          <FontAwesomeIcon
            icon={faPlusCircle}
            className='me-2'
          ></FontAwesomeIcon>
          Create source
        </Button>
      )}
      <Modal
        show={modalShow}
        onHide={() => setModalShow(false)}
        backdrop='static'
        keyboard={false}
      >
        {sourceMediaType === 'twitter' && <>{twitterFormJSX}</>}
        {(sourceMediaType === 'facebook' ||
          sourceMediaType === 'instagram') && <>{crowdtangleFormJSX}</>}
      </Modal>
    </>
  );
}
