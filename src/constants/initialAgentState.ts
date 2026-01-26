export const INITIAL_AGENT_STATE = {
  "agentId": "",
  "agentName": "",
  "channel": "voice",
  "language": "en-US",
  "webhookUrl": "",
  
  "maxCallDurationMs": 600000, // 10 minutes default
  "ringTimeOutMs": 30000,
  "noResponseTimeoutMs": 15000,
  "ivrhangup": true,
  "reEngageAttempts": 3,
  "reEngageMessage": "I'm sorry, I didn't catch that. Are you still there?",
  "waitDurationMs": 1000, // 1 second default
  "userGreetingType": "static",

  "ttsConfig": {
    "provider": "cartesia",
    "model": "sonic-english",
    "voiceId": "", // Removed specific voice ID
    "settings": {
      "voiceTemperature": 0.5,
      "voiceSpeed": 1.0,
      "volume": 1.0,
      "stability": 0.5,
      "similarityBoost": 0.5,
      "styleExaggeration": 0.0,
      "pitch": 0.0
    },
  },

  "sttConfig": {
    "provider": "deepgram",
    "model": "nova-2",
    "settings": {
      "keywords": []
    }
  },
    
  "reacherrLlmData": {
    "provider": "azure",
    "model": "gpt-4o",
    "maxTokens": 450,
    "temperature": 0.2,
    "topK": 40,
    "generalPrompt": "",
    "beginMessage": "",
    "startSpeaker": "ai",
    "modelHighPriority": true,
    "toolCallStrictMode": true,
    
    "kbConfig": {
      "knowledgeBaseIds": [],
      "topK": 3,
      "filterScore": 0.6
    },

    "generalTools": []
  },

  "postCallAnalysis": {
    "webhookEnabled": false,
    "webhookUrl": "",
    "webhookTimeout": 45,
    "extractionItems": []
  },
  
  "voicemailDetection": {
    "enabled": false,
    "action": "hangup",
    "message": ""
  },

  "versionMetadata": {
    "version": 1,
    "versionName": "V0",
    "versionDescription": "",
    "isPublished": false,
    "lastModificationTimestamp": 0,
  }
}