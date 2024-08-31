import { NextApiRequest, NextApiResponse } from "next";
import nodeCron from "node-cron";

let hasStartJob = false;
const appToken: string = process.env.app_token ?? "";
const userIDs: string[] = [
  "UID_9060m1uKN8xNGvPbuqvxxOMQYwB2",
  "UID_xbFfSwmHfKcRCcRdMTOjFlWix0pk",
];

const ahrFetch = async () => {
  const btcAhr999 = await fetch(
    "https://dncapi.shermanantitrustact.com/api/v2/index/arh999?code=bitcoin&webp=1"
  )
    .then((response) => response.json())
    .then((data) => {
      if (data?.code !== 200) return null;

      if (Array.isArray(data.data) && data.data.length > 0) {
        const latestData = data.data.at(-1);

        return {
          ahr999: latestData[1],
          btc: latestData[2],
        };
      }

      return null;
    })
    .catch(() => {
      hasStartJob = false;
      return null;
    });

  if (btcAhr999) {
    await fetch("https://wxpusher.zjiecode.com/api/send/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appToken: process.env.app_token,
        content: JSON.stringify(btcAhr999),
        contentType: 1,
        summary: `BTC-${btcAhr999.btc}-AHR-${btcAhr999.ahr999}`,
        uids: userIDs,
        verifyPayType: 0,
      }),
    })
      .then((response) => response.json())
      .then(console.log)
      .catch((error) => {
        hasStartJob = false;
        console.log("推送信息错误:", error);
      });
  }
};

export default async function handler(
  serverReq: NextApiRequest,
  serverRes: NextApiResponse
) {
  // if (hasStartJob) {
  //   serverRes.status(200).json({
  //     message: "Job started, check your notification on WeChat.",
  //   });
  //   return;
  // }

  // {
  //   hasStartJob = true;
  // }

  const _task = nodeCron.schedule("*/1 * * * *", () => {
    (async () => {
      try {
        await ahrFetch();
        serverRes.status(200).json({ message: "Job is going to be started." });
      } catch (error) {
        serverRes.status(200).json({ message: JSON.stringify(error) });
      }
    })();
  });
}
