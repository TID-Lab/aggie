import axios from "axios";
import {FormikValues} from "formik";
import {Report, ReportQuery, Source, Tag} from "../objectTypes";

export const getReports = async (queryParams: URLSearchParams) => {
  const { data } = await axios.get('/api/report/?' + queryParams.toString());
  return data;
}

export const getReport = async (id: string | undefined) => {
  if (id) {
    const {data} = await axios.get('/api/report/' + id);
    return data;
  }
}

export const editReport = async (report: Report) => {
  const { data } = await axios.put('/api/report/' + report._id, report);
  return data;
}