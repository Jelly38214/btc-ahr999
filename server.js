const express = require("express");
const cron = require("node-cron");

const app = express();
const port = process.env.PORT || 3000;

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
        appToken: "AT_NgZc5jrkn4ZZn7VeY0sktrnByvyel2XR",
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

// 定义一个简单的 cron 任务
cron.schedule("*/1 * * * *", () => {
  (async () => {
    await ahrFetch();
  })();
});

// 一个简单的根路由
app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
