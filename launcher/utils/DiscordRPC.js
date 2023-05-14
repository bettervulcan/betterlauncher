const DiscordRPC = require("discord-rpc");
const clientId = "1106998157772075058";
var rpc;

const setupRPC = (callback) => {
  console.log("Trying setup Discord RPC.");
  DiscordRPC.register(clientId);

  rpc = new DiscordRPC.Client({ transport: "ipc" });
  try {
    rpc.on("ready", async () => {
      console.log(`Connected to Discord as ${rpc.user.username}`);
      callback(rpc.user);
      let emojis = ["😀", "🌳", "⛏️", "🗡️", "🛖", "🐉", "🔥", "💀", "🪁", "💎"],
        emojiIndex = 0,
        startTimestamp = Date.now();
      rpc
        .setActivity({
          state: "Launching Minecraft...",
          details: emojis[emojiIndex],
          startTimestamp,
          largeImageKey: "logo",
          smallImageKey: "mc-launcher",
          instance: true,
          buttons: [
            {
              label: "Join Discord!",
              url: "https://discord.com/invite/D4AytbE6GU",
            },
          ],
        })
        .catch((e) => {
          throw e;
        });

      setInterval(() => {
        emojiIndex++;
        if (emojiIndex > emojis.length - 1) emojiIndex = 0;
        rpc.setActivity({
          state: "Launching Minecraft...",
          details: emojis[emojiIndex],
          startTimestamp,
          largeImageKey: "logo",
          smallImageKey: "mc-launcher",
          instance: false,
          buttons: [
            {
              label: "Join Discord!",
              url: "https://discord.com/invite/D4AytbE6GU",
            },
          ],
        });
      }, 15 * 1000);
    });

    rpc.on("error", (err) => {
      throw new Error(`Error from Discord RPC: ${err}`);
    });

    rpc.login({ clientId }).catch((err) => {
      throw err;
    });
  } catch (error) {
    throw new Error(`Error setuping discord rpc.\n${error}`);
  }
};

module.exports = { setupRPC };
