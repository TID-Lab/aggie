import {Button, Container, Form, Modal} from "react-bootstrap";
import React, {useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlusCircle, faEdit} from "@fortawesome/free-solid-svg-icons";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Formik, FormikValues } from "formik";
import * as Yup from "yup";

interface IProps {
}

const exportCSVFormSchema = Yup.object().shape({
  //TODO: Look at either or validations. See example below for when either email or phone is required.
  /*
  yup.string().test(function (value) {
    const { email } = this.parent;
    if (!email) return value != null
    return true
  })
   */
  exportCSVStartDate: Yup.date(),
  exportCSVEndDate: Yup.date(),
});

/* http://localhost:3000/api/v1/csv/?before=2021-10-28T23:59:00.000Z&after=2021-10-04T23:59:00.000Z  GET REQUEST*/

export default function ExportCSVModal(props: IProps) {
  const [modalShow, setModalShow] = useState(false);
  // @ts-ignore
  return (
      <>
        <Button onClick={()=>setModalShow(true)}>Export CSV</Button>
        <Modal
            show={modalShow}
            onHide={()=>setModalShow(false)}
            backdrop="static"
            keyboard={false}
        >
          <Formik
            initialValues={{exportCSVStartDate: null, exportCSVEndDate: null}}
            validationSchema={exportCSVFormSchema}
            onSubmit={async (values, {setSubmitting, resetForm}) => {
              console.log(values);
            }}
          >
            {({
                values,
                errors,
                touched,
                handleChange,
                handleSubmit,
                isSubmitting,
                setValues,
                /* and other goodies */
              }) => (
                <Form noValidate onSubmit={handleSubmit}>
                  <Modal.Header closeButton>
                    <Modal.Title>CSV Export</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Form.Group className={"mb-3"}>
                      <Form.Label htmlFor="exportStartDate">Set start date</Form.Label>
                      <DatePicker
                          name="exportCSVStartDate"
                          className={"form-control"}
                          onChange={
                            (date) => {
                              /* @ts-ignore */
                              setValues({'exportCSVStartDate': date,
                                'exportCSVEndDate': values.exportCSVEndDate,
                              })
                            }
                          }
                          value={
                            //@ts-ignore
                            values.exportCSVStartDate?.toLocaleString("en-us")
                          }
                          showTimeSelect
                      />
                    </Form.Group>
                    <Form.Group>
                      <Form.Label htmlFor="exportEndDate">Set end date</Form.Label>
                      <DatePicker
                          name="exportCSVEndDate"
                          className={"form-control"}
                          onChange={
                            (date) => {
                              /* @ts-ignore */
                              setValues({'exportCSVEndDate': date,
                                'exportCSVStartDate': values.exportCSVStartDate,
                              })
                            }
                          }
                          value={
                            //@ts-ignore
                            values.exportCSVEndDate?.toLocaleString("en-us")
                          }
                          showTimeSelect
                      />
                    </Form.Group>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={()=>setModalShow(false)}>Cancel</Button>
                    <Button variant="primary" type="submit">Export</Button>
                  </Modal.Footer>
                </Form>
                )}
          </Formik>
        </Modal>
      </>
  )

}