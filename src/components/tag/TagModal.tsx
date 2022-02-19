import {Button, Container, Modal, Form, Alert} from "react-bootstrap";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle, faEdit } from "@fortawesome/free-solid-svg-icons";
import { Dropdown } from "react-bootstrap";
import axios from "axios";
import {Formik, FormikValues} from "formik";
import * as Yup from "yup";
import {Tag, TagEditableData} from "../../objectTypes";
import {useMutation, useQueryClient} from "react-query";
import {editTag, newTag} from "../../api/tags";

interface IProps {
  tag?: Tag,
}

const tagEditSchema = Yup.object().shape({
  tagName: Yup.string()
      .required('Tag name required'),
  tagDescription: Yup.string(),
  tagIsCommentTag: Yup.boolean(),
  tagColor: Yup.string().required("Required")
});



export default function TagModal(props: IProps) {
  const queryClient = useQueryClient();
  const newTagMutation = useMutation((tagData: TagEditableData) => {return newTag(tagData)}, {
    onSuccess: () => {
      handleModalClose();
      queryClient.invalidateQueries("tags");
    }
  })
  const editTagMutation = useMutation((tagData: TagEditableData) => {return editTag(tagData)}, {
    onSuccess: () => {
      handleModalClose();
      queryClient.invalidateQueries("tags");
    }
  });
  const formValuesToTag = (values: FormikValues) => {
    if (props.tag) {
      return {
        name: values.tagName,
        description: values.tagDescription,
        isCommentTag: values.tagIsCommentTag,
        color: values.tagColor,
        _id: props.tag._id
      }
    } else {
      return {
        name: values.tagName,
        description: values.tagDescription,
        isCommentTag: values.tagIsCommentTag,
        color: values.tagColor
      }
    }
  }

  /* Modal state handling */
  const [modalShow, setModalShow] = useState(false);
  const handleModalClose = () => setModalShow(false);
  const handleModalShow = () => setModalShow(true);

  /* Alert state handling */
  const [alertShow, setAlertShow] = useState(false);

  /* Server state handling */
  const [serverState, setServerState] = useState({ok: false, msg: "", res: null});
  const handleServerResponse = (ok: boolean, msg: string, res: any) => {
    if (!ok) setAlertShow(true)
    setServerState({ok: ok, msg: msg, res: res})
  };

  // This is the edit tag modal.
  if (props.tag) {
    return (
        <>
          <Dropdown.Item onClick={handleModalShow}>
            <FontAwesomeIcon icon={faEdit}/> Edit
          </Dropdown.Item>
          <Modal
              show={modalShow}
              onHide={handleModalClose}
              backdrop="static"
              keyboard={false}
          >
            <Formik
                initialValues={
                  {tagName: props.tag.name, tagDescription: props.tag.description,
                  tagIsCommentTag: props.tag.isCommentTag, tagColor: props.tag.color}
                }
                validationSchema={tagEditSchema}
                onSubmit={(values, {setSubmitting, resetForm}) => {
                  editTagMutation.mutate(formValuesToTag(values));
                }}
            >
              {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleSubmit,
                  isSubmitting,
                  setFieldValue,
                  /* and other goodies */
                }) => (
                    <Form noValidate onSubmit={handleSubmit}>
                      <Modal.Header closeButton>
                        {/*@ts-ignore*/}
                        <Modal.Title>Edit tag: {props.tag.name}</Modal.Title>
                      </Modal.Header>
                      <Modal.Body>
                        <Container>
                          {alertShow &&
                              <Alert variant="danger" onClose={() => setAlertShow(false)} dismissible>
                                <Alert.Heading>Oops an error occured!</Alert.Heading>
                                <p>
                                  {serverState.msg}
                                </p>
                              </Alert>
                          }
                          <Form.Group controlId="tagName" className={"mb-3"}>
                            <Form.Label>Tag name</Form.Label>
                            <Form.Control
                                required
                                type="text"
                                placeholder="Tag name"
                                name="tagName"
                                value={values.tagName}
                                onChange={handleChange}
                                isInvalid={touched.tagName && !!errors.tagName}
                            />
                            <Form.Control.Feedback type="invalid">
                              {errors.tagName}
                            </Form.Control.Feedback>
                          </Form.Group>
                          <Form.Group controlId="tagIsCommentTag" className={"mb-3"}>
                            <Form.Check
                                label="Is this a comment tag?"
                                type="switch"
                                name="tagIsCommentTag"
                                checked={values.tagIsCommentTag}
                                onChange={e => setFieldValue('tagIsCommentTag', e.target.checked)}
                                isInvalid={!!errors.tagIsCommentTag}
                            />
                          </Form.Group>
                          <Form.Group controlId="tagDescription" className={"mb-3"}>
                            <Form.Label>Tag description</Form.Label>
                            <Form.Control
                                as="textarea"
                                type="text"
                                name="tagDescription"
                                rows={3}
                                value={values.tagDescription}
                                onChange={handleChange}
                            />
                          </Form.Group>
                          <Form.Group>
                            <Form.Label htmlFor="tagColor">Tag Color</Form.Label>
                            <Form.Control
                                type="color"
                                name="tagColor"
                                value={values.tagColor}
                                onChange={handleChange}
                            />
                          </Form.Group>
                        </Container>
                      </Modal.Body>
                      <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>Close</Button>
                        <Button variant="primary" type={"submit"} disabled={isSubmitting}>Submit</Button>
                      </Modal.Footer>
                    </Form>
                )}
            </Formik>
          </Modal>
        </>
    )
  } else {
    // This is create modal for tags.
    return (
        <>
          <Button variant={"primary"} onClick={handleModalShow}>
            <FontAwesomeIcon icon={faPlusCircle} className={"me-2"}/>
            Create tag
          </Button>
          <Modal
              show={modalShow}
              onHide={handleModalClose}
              backdrop="static"
              keyboard={false}
          >
            <Formik
                initialValues={{tagName: "", tagDescription: "", tagIsCommentTag: false, tagColor: "#ffffff"}}
                validationSchema={tagEditSchema}
                onSubmit={async (values, {setSubmitting, resetForm}) => {
                  newTagMutation.mutate(formValuesToTag(values));
                }}
            >
              {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleSubmit,
                  isSubmitting,
                  setFieldValue,
                }) => (
                  <Form noValidate onSubmit={handleSubmit}>
                    <Modal.Header closeButton>
                      <Modal.Title>Edit tag</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Container>
                        <Form.Group controlId="tagName" className={"mb-3"}>
                          <Form.Label>Tag name</Form.Label>
                          <Form.Control
                              required
                              type="text"
                              placeholder="Tag name"
                              name="tagName"
                              value={values.tagName}
                              onChange={handleChange}
                              isInvalid={touched.tagName && !!errors.tagName}
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.tagName}
                          </Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group controlId="tagIsCommentTag" className={"mb-3"}>
                          <Form.Check
                              label="Is this a comment tag?"
                              type="switch"
                              name="tagIsCommentTag"
                              checked={values.tagIsCommentTag}
                              onChange={e => setFieldValue('tagIsCommentTag', e.target.checked)}
                              isInvalid={!!errors.tagIsCommentTag}
                          />
                        </Form.Group>
                        <Form.Group controlId="tagDescription" className={"mb-3"}>
                          <Form.Label>Tag description</Form.Label>
                          <Form.Control
                              as="textarea"
                              type="text"
                              name="tagDescription"
                              rows={3}
                              value={values.tagDescription}
                              onChange={handleChange}/>
                        </Form.Group>
                        <Form.Group>
                          <Form.Label htmlFor="tagColor">Tag Color</Form.Label>
                          <Form.Control
                              type="color"
                              name="tagColor"
                              value={values.tagColor}
                              onChange={handleChange}
                          />
                        </Form.Group>
                      </Container>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={handleModalClose}>Close</Button>
                      <Button variant="primary" type="submit" disabled={isSubmitting}>Submit</Button>
                    </Modal.Footer>
                  </Form>
              )}
            </Formik>
          </Modal>
        </>
    )
  }
}