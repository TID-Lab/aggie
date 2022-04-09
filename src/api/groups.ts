// Or known on the backend as groups.
import axios from "axios";
import {
  Group,
  GroupEditableData,
  GroupSearchState,
  hasId,
  ReportQuery,
  ReportSearchState,
  Veracity
} from "../objectTypes";

export const getGroups = async (searchState: GroupSearchState = {
  title: null,
  creator: null,
  page: null,
  totalReports: null,
  closed: null,
  before: null,
  after: null,
  idnum: null,
  assignedTo: null,
  locationName: null,
  veracity: null,
  escalated: null
}, tagIds: hasId[] = []) => {
  if (generateGroupsSearchURL(searchState, tagIds) != "") {
    const { data } = await axios.get('/api/group/?' + generateGroupsSearchURL(searchState, tagIds));
    return data;
  } else {
    const { data } = await axios.get('/api/group');
    return data;
  }
}

export const getAllGroups = async () => {
  const { data } = await axios.get('/api/group/all');
  return data;
}

export const getGroup = async (id: string | undefined) => {
  if (id) {
    const { data } = await axios.get('/api/group/' + id);
    return data;
  }
}

export const newGroup = async (groupData: GroupEditableData) => {
  const { data } = await axios.post('/api/group', groupData);
  return data;
}

export const editGroup = async (group: Group | GroupEditableData) => {
  const { data } = await axios.put("/api/group/" + group._id, group);
  return data;
}

export const deleteGroup = async (group: Group) => {
  const { data } = await axios.delete('/api/group/' + group._id);
  return data;
}

export const getGroupReports = async (groupId: string | undefined) => {
  if (groupId) {
    const { data } = await axios.get('/api/report?groupId=' + groupId);
    return data;
  }
}

export const setSelectedVeracity = async (groupIds: string[], veracity: Veracity | string ) => {
  const { data } = await axios.patch('/api/group/_veracity', {ids: groupIds, veracity: veracity});
  return data;
}

export const setSelectedEscalated = async (groupIds: string[], escalated: boolean) => {
  const { data } = await axios.patch('/api/group/_escalated', {ids: groupIds, escalated: escalated});
  return data;
}

export const setSelectedClosed = async (groupIds: string[], closed: boolean) => {
  const { data } = await axios.patch('/api/group/_closed', {ids: groupIds, closed: closed});
  return data;
}

export const setSelectedNotes = async (groupIds: string[], notes: string) => {
  const { data } = await axios.patch('/api/group/_notes', {ids: groupIds, notes: notes});
  return data;
}

const generateGroupsSearchURL = (searchState: GroupSearchState, tagIds: hasId[]) => {
  let url = "";
  if (tagIds.length > 0) { url += "tags=" + tagIds; }
  if (searchState.title) { url += "title=" + searchState.title; }
  if (searchState.creator) { url += "creator=" + searchState.creator; }
  if (searchState.idnum) { url += "idnum=" + searchState.idnum; }
  if (searchState.locationName) { url += "location=" + searchState.locationName; }
  if (searchState.assignedTo) { url += "sourceId=" + searchState.assignedTo; }
  if (searchState.totalReports) { url += "totalReports=" + searchState.totalReports; }
  if (searchState.closed) { url += "closed=" + searchState.closed; }
  if (searchState.before) { url += "before=" + searchState.before; }
  if (searchState.after) { url += "after=" + searchState.after; }
  if (searchState.page) { url += "page=" + searchState.page; }
  return url;
}