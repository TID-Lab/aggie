import axios from "axios";

export const getSession = async () => {
  const { data } = await axios.get('/session', {withCredentials: true});
  return data;
}

export const logOut = async () => {
  const {data} = await axios.get('/logout', {withCredentials: true});
  return data;
}