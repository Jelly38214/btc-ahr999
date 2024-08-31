import nodeCron from "node-cron";

const userIDs = [
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
    .catch(() => null);

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
        console.log("推送信息错误:", error);
      });
  }
};

const task = nodeCron.schedule("*/5 * * * *", () => {
  (async () => {
    await ahrFetch();
  })();
});

task.start();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
