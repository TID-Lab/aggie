// Or known on the backend as incidents.
import axios from "axios";
import {Group, GroupEditableData, ReportQuery} from "../objectTypes";

export const getGroups = async () => {
  const { data } = await axios.get('/api/incident');
  return data;
}

export const getGroup = async (id: string | undefined) => {
  if (id) {
    const { data } = await axios.get('/api/incident/' + id);
    return data;
  }
}

export const newGroup = async (groupData: GroupEditableData) => {
  const { data } = await axios.post('/api/incident', groupData);
  return data;
}

export const editGroup = async (group: Group | GroupEditableData) => {
  const { data } = await axios.put("/api/incident/" + group._id, group);
  return data;
}

export const deleteGroup = async (group: Group) => {
  const { data } = await axios.delete('/api/incident/' + group._id);
  return data;
}

export const getGroupReports = async (groupId: string | undefined) => {
  if (groupId) {
    const { data } = await axios.get('/api/report?incidentId=' + groupId);
    return data;
  }
}