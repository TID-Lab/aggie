import axios from "axios";
import {User} from "../objectTypes";
import {UserEditableData} from "../objectTypes";

export const getUsers = async () => {
  const { data } = await axios.get('/api/user');
  return data;
}

export const getUser = async (id: string) => {
  const { data } = await axios.get('/api/user/' + id);
  return data
}

// We use UserEditableData because we don't actually pass a full user object when creating one.
export const newUser = async (user: UserEditableData) => {
  const { data } = await axios.post('/api/user/', user);
  return data;
}

// We use UserEditableData because we don't actually pass a full user object when editing one.
export const editUser = async (user: UserEditableData) => {
  const { data } = await axios.put('/api/user/' + user._id, user);
  return data;
}

export const deleteUser = async (user: User) => {
  const { data } = await axios.delete('/api/user/' + user._id);
  return data;
}