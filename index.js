const fs = require("node:fs");
const path = require("node:path");
const axios = require("axios");
const sharp = require("sharp");
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

async function resizeImage(inputPath, outputPath) {
  try {
    // 이미지를 읽어들입니다.
    const image = sharp(inputPath);
    
    // 이미지 메타데이터를 가져옵니다.
    const metadata = await image.metadata();
    
    // 원본 이미지의 너비를 가져옵니다.
    const width = metadata.width;
    
    // 3:1 비율에 맞는 높이를 계산합니다.
    const height = Math.round(width / 3);
    
    // 이미지를 resize 합니다.
    await image.resize(width, height, {fit: "fill"}).toFile(outputPath);
    
    console.log(`Image resized to ${width}x${height} and saved to ${outputPath}`);
  } catch (error) {
    console.error('Error resizing image:', error);
  }
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

    await resizeImage(path.join(__dirname, "temp", attachment.name), path.join(__dirname, "temp-resized", attachment.name));

    const resizedImage = fs.readFileSync(path.join(__dirname, "temp-resized", attachment.name));

    // send resized image to reply
    await interaction.reply({
      files: [resizedImage],
      context: "Resized image"
    });
  }

});

client.login(config.token);
