const RssFeedEmitter = require("rss-feed-emitter");
const hookcord = require("hookcord");
const h2m = require("h2m");
const config = require("./config.json");

const feeder = new RssFeedEmitter();
const timeStartup = Date.now();
const { webhooks, rss } = config;

rss.forEach(r => {
  feeder.add({
    url: r.url,
    refresh: 2000
  });
  console.log("Started watching", r.name, "RSS feed at", r.url);
});

feeder.on("new-item", function(item) {
  var time = Date.parse(item.pubdate);
  if (time > timeStartup) {
    const {
      title,
      link: url,
      meta: {
        title: name,
        image: { url: imgUrl }
      }
    } = item;
    const discordMessage = {
      content: url,
      embeds: [
        {
          title,
          url,
          author: { name },
          thumbnail: { url: imgUrl },
          fields: [{ name: "Summary:", value: h2m(item.summary) }]
        }
      ]
    };

    webhooks.forEach(url =>
      new hookcord.Hook()
        .setLink(url.url)
        .setPayload(discordMessage)
        .fire()
        .then(function(response) {
          console.log("response", response);
        })
        .catch(function(e) {})
    );
  }
});
