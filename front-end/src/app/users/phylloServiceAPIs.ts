import axios from "axios";

const PHYLLO_BASE_URL = "https://api.staging.getphyllo.com";
const URL_CREATE_USER = "/v1/users";
const URL_CREATE_USER_TOKEN = "/v1/sdk-tokens";
const URL_GET_ACCOUNT = "/v1/accounts";
const URL_GET_SOCIAL_CONTENTS = "/v1/social/contents";

const PHYLLO_CLIENT_ID = "a92df9e9-c774-4013-a245-1f13f5be5639";
const PHYLLO_SECRET_ID = "c07053fd-6ed6-41e1-a00f-eb7ed58bd283";

const getAxiosInstance = () => {
  const api = axios.create({
    baseURL: PHYLLO_BASE_URL,
    auth: {
      username: PHYLLO_CLIENT_ID,
      password: PHYLLO_SECRET_ID,
    },
  });
  return api;
};

const createUser = async (username, externalId) => {
  try {
    const userId = localStorage.getItem("PHYLLO_USER_ID");
    if (Boolean(userId)) {
      return userId;
    }
    const api = getAxiosInstance();
    let response = await api.post(URL_CREATE_USER, {
      name: username,
      external_id: externalId,
    });
    localStorage.setItem("PHYLLO_USER_ID", response.data.id);
    return response.data.id;
  } catch (err) {
    return err.body;
  }
};

const createUserToken = async (userId) => {
  try {
    const token = localStorage.getItem("PHYLLO_SDK_TOKEN");
    if (Boolean(token)) {
      return token;
    }
    const api = getAxiosInstance();
    let response = await api.post(URL_CREATE_USER_TOKEN, {
      user_id: userId,
      products: ["IDENTITY", "ENGAGEMENT"],
    });
    localStorage.setItem("PHYLLO_SDK_TOKEN", response.data.sdk_token);
    return response.data.sdk_token;
  } catch (err) {
    return err.body;
  }
};

const getAccounts = async (userId) => {
  try {
    const api = getAxiosInstance();
    let response = await api.get(`${URL_GET_ACCOUNT}?user_id=${userId}`);
    return response;
  } catch (err) {
    return err.body;
  }
};

const getSocialContents = async (accountId, limit = 10) => {
  try {
    const api = getAxiosInstance();
    let response = await api.get(URL_GET_SOCIAL_CONTENTS, {
      params: {
        account_id: accountId,
        limit: limit,
      },
    });
    return response.data;
  } catch (err) {
    return err.body;
  }
};

export { createUser, createUserToken, getAccounts, getSocialContents };
