// Or known on the backend as groups.
import axios from "axios";
import {Group, GroupEditableData, ReportQuery} from "../objectTypes";

export const getGroups = async () => {
  const { data } = await axios.get('/api/group');
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