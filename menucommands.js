const { REST, Routes, ApplicationCommandType } = require("discord.js");
const config = require("./config.json");

const commands = [
  {
    name: "Make Emoji",
    type: ApplicationCommandType.Message,
  },
];

const rest = new REST({ version: "10" }).setToken(config.token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(config.clientId), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
