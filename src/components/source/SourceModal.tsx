import {Button, Container, Dropdown, Form, Modal} from "react-bootstrap";
import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle, faEdit} from "@fortawesome/free-solid-svg-icons";
import {capitalizeFirstLetter} from "../../helpers";
import * as Yup from "yup";
import { Formik, FormikValues } from "formik";
import {Credential, MediaType, Source} from "../../objectTypes";
import {useMutation, useQueryClient} from "react-query";
import {newSource, editSource} from "../../api/sources";

interface IProps {
  source?: Source,
  variant: "button" | "dropdown"
  credentials: Credential[];
}

const twitterFormSchema = Yup.object().shape({
  sourceNickname: Yup.string().required('Source nickname required'),
  sourceKeywords: Yup.string().required("Keywords required"),
  sourceCredentials: Yup.string().required('Credentials required'),
});

const sourceFormSchema = Yup.object().shape({
  sourceNickname: Yup.string().required('Source nickname required'),
  sourceKeywords: Yup.string(),
  sourceTags: Yup.string(),
  sourceCredentials: Yup.string().required('Credentials required'),
  sourceURL: Yup.string(),
});

const mediaTypes = ["twitter", "instagram", "RSS", "elmo", "SMS GH", "whatsapp", "facebook", "comments"];

export default function SourceModal(props: IProps) {
  const [sourceMediaType, setSourceMediaType] = useState<MediaType>("twitter"); // Default state of media type
  const [modalShow, setModalShow] = useState(false);
  const queryClient = useQueryClient();
  const newSourceMutation = useMutation((sourceData: any) => {
    return newSource(sourceData);
  }, {
    onSuccess: () => {
      setModalShow(false);
      queryClient.invalidateQueries("sources");
    }
  });
  const editSourceMutation = useMutation((sourceData: any) => {
    return editSource(sourceData);
  }, {
    onSuccess: () => {
      setModalShow(false);
      queryClient.invalidateQueries("sources");
    }
  });
  const formValuesToSource = (values: FormikValues) => {
    switch (sourceMediaType) {
      case "twitter":
        return {
          credentials: values.sourceCredentials,
          keywords: values.sourceKeywords,
          media: sourceMediaType,
          nickname: values.sourceNickname,
        }
        break;
      case "facebook":
        return {
          credentials: values.sourceCredentials,
          media: sourceMediaType,
          nickname: values.sourceNickname,
        }
      default:
        return {

        }
    }
  };
  const defaultCredential = props.credentials.find(credential => credential.type === sourceMediaType) || null;
  const twitterFormJSX = (
      <Formik
        initialValues={{
          sourceNickname: props.source?.nickname || "",
          sourceMedia: props.source?.media || "",
          sourceKeywords: props.source?.keywords || "",
          sourceTags: props.source?.tags || "",
          sourceCredentials: props.source?.credentials._id || defaultCredential?._id || "",
          sourceURL: props.source?.url || "",
        }}
        validationSchema={sourceFormSchema}
        onSubmit={async (values, {setSubmitting, resetForm}) => {
          if (props.source) {editSourceMutation.mutate(formValuesToSource(values));}
          else {newSourceMutation.mutate(formValuesToSource(values));}
        }}
      >
        {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            isSubmitting,
            /* and other goodies */
          }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Modal.Header closeButton>
                <Modal.Title>Create source</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Container>
                  <Form.Group controlId="sourceMedia" className="mb-3">
                    <Form.Label>Media</Form.Label>
                    <Form.Select
                        value={sourceMediaType}
                        onChange={e=>{
                          /*
                          TODO: Getting a ts error because value is not always part of the EventTarget type.
                          In order to fix we need a eventTarget type that has a value field.
                           */
                          //@ts-ignore
                          setSourceMediaType(e.target.value);
                        }}
                    >
                      {mediaTypes.map((mediaType) => {
                        return (
                            <option key={mediaType} value={mediaType}>
                              {capitalizeFirstLetter(mediaType)}
                            </option>
                        )
                      })}
                    </Form.Select>
                  </Form.Group>
                  <Form.Group controlId="sourceNickname" className={"mb-3"}>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        name="sourceNickname"
                        placeholder="Enter name"
                        value={values.sourceNickname}
                        onChange={handleChange}
                    />
                  </Form.Group>
                  <Form.Group controlId="sourceKeywords" className={"mb-3"}>
                    <Form.Label>Keywords</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        name="sourceKeywords"
                        placeholder="Enter keywords"
                        value={values.sourceKeywords}
                        onChange={handleChange}
                    />
                    <Form.Text muted>
                      Separated by commas, e.g. <i>banana, apple, mango</i>. Click {" "}
                      <a href={"https://dev.twitter.com/streaming/overview/request-parameters#track"}>here</a>
                      {" "} for details on how this is used to find tweets.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group controlId="sourceCredentials" className="mb-3">
                    <Form.Label>Credentials</Form.Label>
                    <Form.Select
                        value={values.sourceCredentials}
                        onChange={handleChange}
                    >
                      {props.credentials.map((cred: Credential)=>{
                        if (cred.type === "twitter") {
                          return <option key={cred._id} value={cred._id}>{cred.name}</option>
                        }
                      })}
                    </Form.Select>
                    <Form.Text muted>
                      Select which credentials will be used for API calls.
                    </Form.Text>
                  </Form.Group>
                </Container>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={()=>setModalShow(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>Submit</Button>
              </Modal.Footer>
            </Form>
        )}
      </Formik>
  );
  const facebookInstagramFormJSX = (
      <Formik
          initialValues={{
            sourceNickname: props.source?.nickname || "",
            sourceCredentials: props.source?.credentials._id || defaultCredential?._id || "",
          }}
          validationSchema={sourceFormSchema}
          onSubmit={async (values, {setSubmitting, resetForm}) => {
            if (props.source) {editSourceMutation.mutate(formValuesToSource(values));}
            else {
              newSourceMutation.mutate(formValuesToSource(values));
              console.log("hello")
            }
          }}
      >
        {({
            values,
            errors,
            touched,
            handleChange,
            handleSubmit,
            isSubmitting,
            /* and other goodies */
          }) => (
            <Form noValidate onSubmit={handleSubmit}>
              <Modal.Header closeButton>
                <Modal.Title>Create source</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <Container>
                  <Form.Group controlId="sourceMedia" className="mb-3">
                    <Form.Label>Media</Form.Label>
                    <Form.Select
                        value={sourceMediaType}
                        onChange={(e)=>{
                          /*
                          TODO: Getting a ts error because value is not always part of the EventTarget type.
                          In order to fix we need a eventTarget type that has a value field.
                           */
                          //@ts-ignore
                          setSourceMediaType(e.target.value);
                        }}
                    >
                      {mediaTypes.map((mediaType) => {
                        return (
                            <option key={mediaType} value={mediaType}>
                              {capitalizeFirstLetter(mediaType)}
                            </option>
                        )
                      })}
                    </Form.Select>

                  </Form.Group>
                  <Form.Group controlId="sourceNickname" className={"mb-3"}>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        required
                        type="text"
                        name="sourceNickname"
                        placeholder="Enter name"
                        value={values.sourceNickname}
                        onChange={handleChange}
                    />
                    <Form.Text muted>
                      Providing a name keeps track of which source a report is from.
                    </Form.Text>
                  </Form.Group>
                  <Form.Group controlId="sourceCredentials" className="mb-3">
                    <Form.Label>Credentials</Form.Label>
                    <Form.Select
                        value={values.sourceCredentials}
                        onChange={handleChange}
                    >
                      {props.credentials.map((cred: Credential)=>{
                        if (cred.type === "crowdtangle") {
                          return <option key={cred._id} value={cred._id}>{cred.name}</option>
                        }
                      })}
                    </Form.Select>
                    <Form.Text muted>
                      Select which API credentials will be used for API calls. Find more info on the Crowdtangle API
                      {" "}<a href="https://help.crowdtangle.com/en/articles/1189612-crowdtangle-api">here</a>.
                    </Form.Text>
                  </Form.Group>
                </Container>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={()=>setModalShow(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={isSubmitting}>Submit</Button>
              </Modal.Footer>
            </Form>
        )}
      </Formik>
  );

  return (
      <>
        {props.source && props.variant === "dropdown" &&
        <Dropdown.Item onClick={()=>setModalShow(true)}><FontAwesomeIcon icon={faEdit}/> Edit</Dropdown.Item>
        }
        {props.source && props.variant === "button" &&
        <Button variant="secondary" onClick={()=>setModalShow(true)}>
            <FontAwesomeIcon icon={faEdit}/> Edit
        </Button>
        }
        {!props.source &&
        <Button variant={"primary"} onClick={()=>setModalShow(true)}>
            <FontAwesomeIcon icon={faPlusCircle} className="me-2"></FontAwesomeIcon>
            Create source
        </Button>
        }
        <Modal
            show={modalShow}
            onHide={()=>setModalShow(false)}
            backdrop="static"
            keyboard={false}
        >
          {sourceMediaType === "twitter" &&
          <>{twitterFormJSX}</>
          }
          {(sourceMediaType === "facebook" || sourceMediaType === "instagram") &&
          <>{facebookInstagramFormJSX}</>
          }
        </Modal>
      </>
  )
}