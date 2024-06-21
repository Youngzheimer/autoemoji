const fs = require("node:fs");
const path = require("node:path");
const axios = require("axios");
const { Client, Collection, Events, GatewayIntentBits } = require("discord.js");
const config = require("./config.json");

async function downloadFile(url, outputPath) {
  const writer = fs.createWriteStream(outputPath);

  const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream'
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
  });
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isMessageContextMenuCommand()) return;

  const { commandName } = interaction;

  if (commandName === "Make Emoji") {
    const attachment = interaction.options.getMessage("message").attachments.first();
    if (!attachment) return interaction.reply("No attachment found.");

    await downloadFile(attachment.url, path.join(__dirname, "temp", attachment.name));

    await interaction.reply({
      content: "What should the emoji name be?",
      ephemeral: true
    });
  }

});

client.login(config.token);
