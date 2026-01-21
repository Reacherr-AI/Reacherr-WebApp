export const INITIAL_AGENT_STATE = {
  "agentId": "624af907-6970-4988-abd2-2fab2228eea9",
  "agentName": "Solar Sales Associate",
  "channel": "voice",
  "language": "en-US",
  "webhookUrl": "https://www.callie.in/webhooks/call-events",
  
  "maxCallDurationMs": 600000,
  "ringTimeOutMs": 30000,
  "noResponseTimeoutMs": 10000,
  "ivrhangup":true,
  "reEngageAttempts": 3,
  "reEngageMessage": "I'm sorry, I didn't catch that. Are you still there?",
  "waitDurationMs": 1000,
  "userGreetingType": "static",

  "ttsConfig": {
    "provider": "cartesia",
    "model": "sonic-english",
    "voiceId": "cartesia-Adam",
    "settings": {
      "voiceTemperature": 0.5,
      "voiceSpeed": 1.1,
      "volume": 1.0,
      "stability": 0.75,
      "similarityBoost": 0.75,
      "styleExaggeration": 0.0,
      "pitch": 0.0
    },
    "voice": {
      "voiceId": "cartesia-Adam",
      "displayName": "Adam",
      "provider": "cartesia",
      "gender": "Male"
    }
  },

  "sttConfig": {
    "provider": "deepgram",
    "model": "nova-2",
    "settings": {
      "keywords": ["Solar", "Energy", "Inverter", "Tax Credit"]
    }
  },
    "responseEngine": {
        "type": "single-prompt",
        "llmId": "llm_933789968146b9a3276104234dc0",
        "version": 4
    },
    
  "reacherrLlmData": {
    "llmId": "llm_933789968146b9a3276104234dc0",
    "provider": "azure",
    "model": "gpt-4o",
    "maxTokens": 450,
    "temperature": 0.2,
    "generalPrompt": "You are a helpful solar energy consultant for Callie.in. Your goal is to qualify leads and book appointments.",
    "beginMessage": "Hello! I'm calling from Callie's solar division. How are you doing today?",
    "startSpeaker": "agent",
    "modelHighPriority": true,
    "toolCallStrictMode": true,
    
    "kbConfig": {
      "knowledgeBaseIds": [],
      "topK": 3,
      "filterScore": 0.6
    },

    "generalTools": [
      {
        "type": "end_call",
        "name": "end_call",
        "description": "End the call gracefully."
      },
      {
        "type": "transfer_call",
        "name": "transfer_to_human",
        "description": "Transfer to a human specialist.",
        "transferDestination": "+18563630633",
        "transferOption": {
          "type": "warm_transfer",
          "enableBridgeAudioCue": true,
          "showTransfereeAsCaller": true
        }
      },
      {
        "type": "book_appointment_cal",
        "name": "book_calendar",
        "eventTypeId": 123,
        "calApiKey": "cal_live_xxxx",
        "timezone": "America/Los_Angeles",
        "requiredFields": ["name", "email"]
      },
      {
        "type": "custom",
        "name": "callie_webhook",
        "description": "Ping external server",
        "url": "https://www.callie.in",
        "method": "POST",
        "headers": {
            "auth": "bearer_token_123"
        },
        "queryParams": {},
        "parameterType": "json",
        "speakAfterExecution": true,
        "speakDuringExecution": false,
        "argsAtRoot": false,
        "timeoutMs": 5000,
        "responseVariables": {}
    },
    ]
  },

  "postCallAnalysis": {
    "webhookEnabled": true,
    "webhookUrl": "https://www.callie.in/webhooks/analysis",
    "webhookTimeout": 45,
    "extractionItems": [
      {
        "id": "summary",
        "name": "Call Summary",
        "type": "text",
        "description": "Summarize the call in 2 sentences."
      },
      {
        "id": "ai_experience",
        "name": "User Satisfaction",
        "type": "selector",
        "options": ["satisfied", "unsatisfied"]
      }
    ]
  },
  
  "voicemailDetection": {
    "enabled": false,
    "action": "hangup",
    "message": ""
  },

  "versionMetadata": {
    "version": 1,
    "versionName": "V0 - Initial Setup",
    "versionDescription": "Initial agent configuration for testing purposes.",
    "isPublished": false,
    "lastModificationTimestamp": 1700000000000,
    "inboundPhoneNumberEnabled": false,
    "outboundPhoneNumberEnabled": false
  }
}