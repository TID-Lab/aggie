import axios from "axios";
import {FormikValues} from "formik";
import {Report, ReportQuery, ReportSearchState, Source, Tag} from "../objectTypes";

export const getReports = async (searchState: ReportSearchState) => {
  const { data } = await axios.get('/api/report/?' + generateSearchURL(searchState));
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