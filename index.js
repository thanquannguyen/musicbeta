const { Client, Intents } = require("discord.js")
const ytdl = require("ytdl-core");
const { joinVoiceChannel, createAudioPlayer, createAudioResource } = require("@discordjs/voice");
const DisTube = require("distube").default;
//npm i libsodium-wrappers  npm i @discordjs/opus  
const client = new Client({
  shards: "auto", //1700+ servers
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_VOICE_STATES
  ],
  ws: { properties: { $browser: "Discord iOS" } }
})
const keepAlive = require('./server');
keepAlive();

client.login(process.env.token);
client.on("error", () => { client.login(process.env.token) });

const Channels = ["890534735351263232", ""];
client.on("ready", async () => {
  // client.user.setPresence({
  //   status: 'online',
  //   activity: {
  //     name: 'VNC Lofi Radio to study/relax/sleep',
  //     type: 'PLAYING'
  //   }
  // })
  client.user.setActivity(`VNC Lofi Radio to study/relax/sleep`, { type: 'LISTENING' });

  for (const channelId of Channels) {
    joinChannel(channelId);
    //wait 500ms       
    await new Promise(res => setTimeout(() => res(2), 500))
    //joinChannel(Channels);
  }

  function joinChannel(channelId) {
    client.channels.fetch(channelId).then(async channel => {
      //JOIN THE VC AND PLAY AUDIO
      const VoiceConnection = joinVoiceChannel({
        channelId: channel.id,
        guildId: channel.guild.id,
        adapterCreator: channel.guild.voiceAdapterCreator
      });
      const resource = createAudioResource(ytdl("https://youtu.be/jfKfPfyJRdk"), {
        highWaterMark: 1024 * 1024 * 64,
        quality: "highestaudio",
        filter: "audioonly",
        liveBuffer: 60000,
        dlChunkSize: 1024 * 1024 * 64,
      }, {
        requestOptions: {
          headers: {
            Cookie: process.env.cookie,
            keepAlive: true
          }
        },
        inlineVolume: true,
        youtubeDL: true,
        updateYouTubeDL: true,
      })
      // resource.volume.setVolume(0.2);
      const player = createAudioPlayer()
      VoiceConnection.subscribe(player)
      setTimeout(async () => {
        try {
          await player.play(resource).catch(error => console.log(error));
        } catch (e) { }
      }, 20000)
      player.on("idle", () => {
        try {
          player.stop()
        } catch (e) { }
        try {
          VoiceConnection.destroy()
        } catch (e) { }
        joinChannel(channel.id)
      })
    }).catch(console.error)
  }




})

client.on("voiceStateUpdate", async (oldState, newState) => {
  if (newState.channelId && newState.channel.type === "GUILD_STAGE_VOICE" && newState.guild.me.voice.suppress) {
    try {
      await newState.guild.me.voice.setSuppressed(false)
    } catch (e) {

    }
  }
})
