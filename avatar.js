require('dotenv').config();

const sdk = require('microsoft-cognitiveservices-speech-sdk');

const speechKey    = process.env.SPEECH_KEY;
const speechRegion = process.env.SPEECH_REGION;
if (!speechKey || !speechRegion) {
  console.error("Missing SPEECH_KEY or SPEECH_REGION in .env");
  process.exit(1);
}

const openAIEndpoint = process.env.OPENAI_ENDPOINT;
const openAIKey      = process.env.OPENAI_KEY;
const deploymentName = process.env.DEPLOYMENT_NAME;
const systemPrompt   = process.env.SYSTEM_PROMPT;
const searchEndpoint = process.env.SEARCH_ENDPOINT;
const searchKey      = process.env.SEARCH_KEY;
const indexName      = process.env.INDEX_NAME;

const speechConfig = sdk.SpeechConfig.fromSubscription(speechKey, speechRegion);  
speechConfig.setProperty(
  sdk.PropertyId.SpeechServiceConnection_Endpoint,
  `wss://${speechRegion}.tts.speech.microsoft.com/cognitiveservices/websocket/v1?enableTalkingAvatar=true`
);

const attach = (name, value) =>
  speechConfig.setServiceProperty(name, encodeURIComponent(value), sdk.ServicePropertyChannel.UriQueryParameter);

attach('avatarCharacter', 'lisa');
attach('avatarStyle',     'casual-sitting');
attach('openai-endpoint', openAIEndpoint);
attach('openai-key',      openAIKey);
attach('deployment-name', deploymentName);
attach('system-prompt',   systemPrompt);
attach('search-endpoint', searchEndpoint);
attach('search-key',      searchKey);
attach('search-index',    indexName);

// 3) Create an AudioConfig for your default speaker
const audioConfig = sdk.AudioConfig.fromDefaultSpeakerOutput();  // :contentReference[oaicite:1]{index=1}

// 4) Wire up the synthesizer with both configs
const synthesizer = new sdk.SpeechSynthesizer(speechConfig, audioConfig);

console.log('Starting avatar session…');
synthesizer.speakTextAsync(
  'Hello! Your avatar is now live. How can I assist you today?',
  result => {
    console.log('Synthesis complete. Exiting.');
    synthesizer.close();
    process.exit(0);
  },
  error => {
    console.error('Error during synthesis:', error);
    synthesizer.close();
    process.exit(1);
  }
);
