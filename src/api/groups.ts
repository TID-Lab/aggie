// Or known on the backend as groups.
import axios from "axios";
import {
  Group,
  GroupEditableData,
  GroupSearchState,
  hasId,
  VeracityOptions
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
    const { data } = await axios.get('/api/group?' + generateGroupsSearchURL(searchState, tagIds));
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

export const getGroupReports = async (groupId: string | undefined, page: number) => {
  if (groupId) {
    const { data } = await axios.get('/api/report?groupId=' + groupId + "&page=" + page);
    return data;
  }
}

export const setSelectedVeracity = async (groupIds: string[], veracity: VeracityOptions | string ) => {
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

export const setSelectedTitle = async (groupIds: string[], title: string) => {
  const { data } = await axios.patch('/api/group/_title', {ids: groupIds, title: title});
  return data;
}

export const setSelectedNotes = async (groupIds: string[], notes: string) => {
  const { data } = await axios.patch('/api/group/_notes', {ids: groupIds, notes: notes});
  return data;
}

export const setSelectedLocationName = async (groupIds: string[], locationName: string) => {
  const { data } = await axios.patch('/api/group/_locationName', {ids: groupIds, locationName: locationName});
  return data;
}

const generateGroupsSearchURL = (searchState: GroupSearchState, tagIds: hasId[]) => {
  let url = "";
  if (tagIds.length > 0) { url += "tags=" + tagIds; }
  if (searchState.title) {
    if (url === "") url += "title=" + searchState.title;
    else url += "&title=" + searchState.title;
  }
  if (searchState.creator) {
    if (url === "") url += "creator=" + searchState.creator;
    else url += "&creator=" + searchState.creator;
  }
  if (searchState.idnum) {
    if (url === "") url += "idnum=" + searchState.idnum;
    else url += "&idnum=" + searchState.idnum;
  }
  if (searchState.locationName) {
    if (url === "") url += "location=" + searchState.locationName;
    else url += "&location=" + searchState.locationName;
  }
  if (searchState.assignedTo) {
    if (url === "") url += "assignedTo=" + searchState.assignedTo;
    else url += "&assignedTo=" + searchState.assignedTo;
  }
  if (searchState.veracity) {
    if (url === "") url += "veracity=" + searchState.veracity;
    else url += "&veracity=" + searchState.veracity;
  }
  if (searchState.totalReports) {
    if (url === "") url += "totalReports=" + searchState.totalReports;
    else url += "&totalReports=" + searchState.totalReports;
  }
  if (searchState.closed) {
    if (url === "") url += "closed=" + searchState.closed;
    else url += "&closed=" + searchState.closed;
  }

  if (searchState.escalated) {
    if (url === "") url += "escalated=" + searchState.escalated;
    else url += "&escalated=" + searchState.escalated;
  }

  if (searchState.before) {
    if (url === "") url += "before=" + searchState.before;
    else url += "&before=" + searchState.before;
  }
  if (searchState.after) {
    if (url === "") url += "after=" + searchState.after;
    else url += "&after=" + searchState.after;
  }

  if (searchState.page) {
    if (url === "") url += "page=" + searchState.page;
    else url += "&page=" + searchState.page;
  }
  return url;
}