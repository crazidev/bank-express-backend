import { ONESIGNAL_APP_ID, ONESIGNAL_TOKEN } from "../config/constants";
import { AxiosResponse, AxiosError } from "axios";
const axios = require("axios");

interface SendPushProps {
  content: string;
  subscription_ids: string[];
  data?: {} | null;
  heading: string;
  group?: string;
  big_picture?: string | null;
  app_url?: string;
}

export default async function sendPush(props: SendPushProps) {
  let data = JSON.stringify({
    app_id: ONESIGNAL_APP_ID,
    include_subscription_ids: props.subscription_ids,
    data: props.data,
    android_group: props.group,
    thread_id: props.group,
    app_url: props.app_url,
    big_picture: props.big_picture,
    headings: { en: props.heading },
    contents: {
      en: props.content,
    },
  });

  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://onesignal.com/api/v1/notifications",
    headers: {
      "Content-Type": "application/json",
      Header: ONESIGNAL_TOKEN,
    },
    data: data,
  };

  axios
    .request(config)
    .then((response: AxiosResponse) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error: AxiosError) => {
      console.log(error);
    });
}
