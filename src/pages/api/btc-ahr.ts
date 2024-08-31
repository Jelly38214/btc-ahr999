import { NextApiRequest, NextApiResponse } from "next";

const appToken: string = process.env.app_token ?? "";

export default async function handler(
  serverReq: NextApiRequest,
  serverRes: NextApiResponse
) {
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
    .catch(() => null);

  if (btcAhr999) {
    await fetch("https://wxpusher.zjiecode.com/api/send/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        appToken,
        content: JSON.stringify(btcAhr999),
        contentType: 1,
        summary: `BTC-${btcAhr999.btc}-AHR-${btcAhr999.ahr999}`,
        uids: ["UID_9060m1uKN8xNGvPbuqvxxOMQYwB2"],
        verifyPayType: 0,
      }),
    })
      .then((response) => response.json())
      .then(console.log)
      .catch((error) => {
        console.log("推送信息错误:", error);
      });
  }

  serverRes.status(200).json(btcAhr999 ?? { message: "Fail to get ahr999" });
}
