import axios from "axios";
import {FormikValues} from "formik";
import {Report, ReportQuery, ReportSearchState, Source, Tag} from "../objectTypes";

export const getReports = async (searchState: ReportSearchState) => {
  if (generateSearchURL(searchState) != "") {
    const { data } = await axios.get('/api/report/?' + generateSearchURL(searchState));
    return data;
  } else {
    const { data } = await axios.get('/api/report');
    return data;
  }

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

export const getBatch = async () => {
  const { data } = await axios.get('/api/report/batch');
  return data;
}

export const getNewBatch = async () => {
  const { data } = await axios.patch('/api/report/batch');
  return data;
}

export const cancelBatch = async () => {
  const { data } = await axios.put('/api/report/batch');
  return data;
}

export const setSelectedRead = async (reportIds: string[]) => {
  const { data } = await axios.patch('/api/report/_read', {ids: reportIds, read: true});
  return data;
}

export const setGroup = async (groupId: string) => {
  const { data } = await axios.put('/api/batch');
  return data;
}

const generateSearchURL = (searchState: ReportSearchState) => {
  let url = "";
  if (searchState.tags) { url += "tags=" + searchState.tags; }
  if (searchState.keywords) { url += "keywords=" + searchState.keywords; }
  if (searchState.author) { url += "author=" + searchState.author; }
  if (searchState.groupId) { url += "groupId=" + searchState.groupId; }
  if (searchState.media) { url += "media=" + searchState.media; }
  if (searchState.sourceId) { url += "sourceId=" + searchState.sourceId; }
  if (searchState.list) { url += "list=" + searchState.list; }
  if (searchState.before) { url += "before=" + searchState.before; }
  if (searchState.after) { url += "after=" + searchState.after; }
  if (searchState.page) { url += "page=" + searchState.page; }
  return url;
}