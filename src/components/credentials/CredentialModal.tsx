import {Button, Container, Form, Modal} from "react-bootstrap";
import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle} from "@fortawesome/free-solid-svg-icons";
import {capitalizeFirstLetter} from "../../helpers";
import * as Yup from "yup";
import { Formik, FormikValues } from "formik";
import { Credential } from "../../objectTypes";
import {useMutation} from "react-query";
import {newCredential} from "../../api/credentials";

interface IProps {
  credential?: Credential,
}

const twitterCredentialsFormSchema = Yup.object().shape({
  credentialName: Yup.string()
      .required('Credentials name required'),
  credentialConsumerKey: Yup.string().required("Consumer key required."),
  credentialConsumerSecret: Yup.string().required("Consumer secret required."),
  credentialAccessToken: Yup.string().required("Access Token required."),
  credentialAccessTokenSecret: Yup.string().required("Access Token secret required.")
});

const crowdTangleCredentialsFormSchema = Yup.object().shape({
  credentialName: Yup.string()
      .required('Credentials name required'),
  credentialDashboardAPIToken: Yup.string().required('API Token required'),
});

const telegramCredentialsFormSchema = Yup.object().shape({
  credentialName: Yup.string()
      .required('Credentials name required'),
  credentialBotAPIToken: Yup.string().required('API Token required'),
});

const credentialTypes = ["crowdtangle", "twitter", "telegram"];

export default function CredentialModal(props: IProps) {
  const [modalShow, setModalShow] = useState(false);
  const handleModalClose = () => setModalShow(false);
  const handleModalShow = () => setModalShow(true);
  const [credentialType, setCredentialType] = useState("twitter");
  const newCredentialMutation = useMutation((credentialData: any) => {
    return newCredential(credentialData);
  }, {
    onSuccess: () => {handleModalClose();}
  });

  /* Alert state handling */
  const [alertShow, setAlertShow] = useState(false);

  /* Server state handling */
  const [serverState, setServerState] = useState({ok: false, msg: "", res: null});
  const handleServerResponse = (ok: boolean, msg: string, res: any) => {
    if (!ok) setAlertShow(true)
    setServerState({ok: ok, msg: msg, res: res})
  };
  const formValuesToCredential = (values: FormikValues) => {
    switch (credentialType) {
      case 'crowdtangle':
        return {
          credentials: {},
          name: values.credentialName,
          type: credentialType,
          secrets: {
            dashboardAPIToken: values.credentialDashboardAPIToken
          }
        }
        break;
      case 'twitter':
        return {
          credentials: {},
          name: values.credentialName,
          type: credentialType,
          secrets: {
            consumerKey: values.credentialConsumerKey,
            consumerSecret: values.credentialConsumerSecret,
            accessToken: values.credentialAccessToken,
            accessTokenSecret: values.credentialAccessTokenSecret,
          }
        }
      case 'telegram':
        return {
          credentials: {},
          name: values.credentialName,
          type: credentialType,
          secrets:  {
            botAPIToken: values.credentialBotAPIToken
          }
        }
        break;
      default:
        console.error("No credential type was selected.")
        return null;
    }
  };
  const twitterFormJSX = (
      <>
        <Formik
            initialValues={{
              credentialName: "",
              credentialConsumerKey: "",
              credentialConsumerSecret: "",
              credentialAccessToken: "",
              credentialAccessTokenSecret: "",
            }}
            validationSchema={twitterCredentialsFormSchema}
            onSubmit={async (values, {setSubmitting, resetForm}) => {
             newCredentialMutation.mutate(formValuesToCredential(values));
            }}
        >
          {({
              values,
              errors,
              touched,
              handleChange,
              handleSubmit,
              isSubmitting,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                  <Modal.Title>New credential</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Container>
                    <Form.Group controlId="credentialType" className={"mb-3"}>
                      <Form.Label>Credential type</Form.Label>
                      <Form.Select
                          value={credentialType}
                          onChange={e=>{
                            /*
                            TODO: Getting a ts error because value is not always part of the EventTarget type.
                            In order to fix we need a eventTarget type that has a value field.
                             */
                            //@ts-ignore
                            setCredentialType(e.target.value);
                          }}
                      >
                        {credentialTypes.map((credentialType) => {
                          return <option key={credentialType} value={credentialType}>
                            {capitalizeFirstLetter(credentialType)}
                          </option>
                        })}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="credentialName" className={"mb-3"}>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                          required
                          type="text"
                          name="credentialName"
                          placeholder="Enter credential name"
                          value={values.credentialName}
                          onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group controlId="credentialAPIToken" className={"mb-3"}>
                      <Form.Label>Consumer key</Form.Label>
                      <Form.Control
                          required
                          type="text"
                          name="credentialConsumerKey"
                          placeholder="Enter consumer_key"
                          value={values.credentialConsumerKey}
                          onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group controlId="credentialAPIToken" className={"mb-3"}>
                      <Form.Label>Consumer secret</Form.Label>
                      <Form.Control
                          required
                          type="text"
                          name="credentialConsumerSecret"
                          placeholder="Enter consumer_secret"
                          value={values.credentialConsumerSecret}
                          onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group controlId="credentialAPIToken" className={"mb-3"}>
                      <Form.Label>Access token</Form.Label>
                      <Form.Control
                          required
                          type="text"
                          name="credentialAccessToken"
                          placeholder="Enter oauth_token"
                          value={values.credentialAccessToken}
                          onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group controlId="credentialAPIToken" className={"mb-3"}>
                      <Form.Label>Access token secret</Form.Label>
                      <Form.Control
                          required
                          type="text"
                          name="credentialAccessTokenSecret"
                          placeholder="Enter oauth_token_secret"
                          value={values.credentialAccessTokenSecret}
                          onChange={handleChange}
                      />
                    </Form.Group>
                  </Container>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>Submit</Button>
                </Modal.Footer>
              </Form>
          )}
        </Formik>
      </>
  );

  const crowdTangleFormJSX = (
      <>
        <Formik
            initialValues={{
              credentialName: "",
              credentialDashboardAPIToken: ""
            }}
            validationSchema={crowdTangleCredentialsFormSchema}
            onSubmit={async (values, {setSubmitting, resetForm}) => {
              newCredentialMutation.mutate(formValuesToCredential(values));
            }}
        >
          {({
              values,
              errors,
              touched,
              handleChange,
              handleSubmit,
              isSubmitting,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                  <Modal.Title>New credential</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Container>
                    <Form.Group controlId="credentialType" className={"mb-3"}>
                      <Form.Label>Credential type</Form.Label>
                      <Form.Select
                          value={credentialType}
                          onChange={e=>{
                            /*
                            TODO: Getting a ts error because value is not always part of the EventTarget type.
                            In order to fix we need a eventTarget type that has a value field.
                             */
                            //@ts-ignore
                            setCredentialType(e.target.value);
                          }}
                      >
                        {credentialTypes.map((credentialType) => {
                          return <option key={credentialType} value={credentialType}>
                            {capitalizeFirstLetter(credentialType)}
                          </option>
                        })}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="credentialName" className={"mb-3"}>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                          required
                          type="text"
                          name="credentialName"
                          placeholder="Enter credential name"
                          value={values.credentialName}
                          onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group controlId="credentialDashboardAPIToken" className={"mb-3"}>
                      <Form.Label>Dashboard API token</Form.Label>
                      <Form.Control
                          required
                          type="text"
                          name="credentialDashboardAPIToken"
                          placeholder="Dashboard API token"
                          value={values.credentialDashboardAPIToken}
                          onChange={handleChange}
                      />
                    </Form.Group>
                  </Container>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>Submit</Button>
                </Modal.Footer>
              </Form>
          )}
        </Formik>
      </>
  );

  const telegramFormJSX = (
      <>
        <Formik
            initialValues={{
              credentialName: "",
              credentialBotAPIToken: ""
            }}
            validationSchema={telegramCredentialsFormSchema}
            onSubmit={async (values, {setSubmitting, resetForm}) => {
              newCredentialMutation.mutate(formValuesToCredential(values));
            }}
        >
          {({
              values,
              errors,
              touched,
              handleChange,
              handleSubmit,
              isSubmitting,
            }) => (
              <Form noValidate onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                  <Modal.Title>New credential</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Container>
                    <Form.Group controlId="credentialType" className={"mb-3"}>
                      <Form.Label>Credential type</Form.Label>
                      <Form.Select
                          value={credentialType}
                          onChange={e=>{
                            /*
                            TODO: Getting a ts error because value is not always part of the EventTarget type.
                            In order to fix we need a eventTarget type that has a value field.
                             */
                            //@ts-ignore
                            setCredentialType(e.target.value);
                          }}
                      >
                        {credentialTypes.map((credentialType) => {
                          return <option key={credentialType} value={credentialType}>
                            {capitalizeFirstLetter(credentialType)}
                          </option>
                        })}
                      </Form.Select>
                    </Form.Group>
                    <Form.Group controlId="credentialName" className={"mb-3"}>
                      <Form.Label>Name</Form.Label>
                      <Form.Control
                          required
                          type="text"
                          name="credentialName"
                          placeholder="Enter credential name"
                          value={values.credentialName}
                          onChange={handleChange}
                      />
                    </Form.Group>
                    <Form.Group controlId="credentialBotAPIToken" className={"mb-3"}>
                      <Form.Label>Bot API Token</Form.Label>
                      <Form.Control
                          required
                          type="text"
                          name="credentialBotAPIToken"
                          placeholder="Enter Bot API token"
                          value={values.credentialBotAPIToken}
                          onChange={handleChange}
                      />
                    </Form.Group>
                  </Container>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleModalClose}>Cancel</Button>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>Submit</Button>
                </Modal.Footer>
              </Form>
          )}
        </Formik>
      </>
  );

  return (
      <>
        <Button variant={"primary"} onClick={handleModalShow}>
          <FontAwesomeIcon icon={faPlusCircle} className="me-2"></FontAwesomeIcon>
          Create credentials
        </Button>
        <Modal
            show={modalShow}
            onHide={handleModalClose}
            backdrop="static"
            keyboard={false}
        >
          {credentialType === "twitter" &&
          <>{twitterFormJSX}</>
          }
          {credentialType === "crowdtangle" &&
          <>{crowdTangleFormJSX}</>
          }
          {credentialType === "telegram" &&
          <>{telegramFormJSX}</>
          }
        </Modal>
      </>
  )
}