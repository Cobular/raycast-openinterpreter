export interface OpenInterpreterPreferences {
  "openinterpreter-openai-api-key": string;
  "openinterpreter-openai-model": OpenAIModel;
  "openinterpreter-openai-budget"?: number;
}

export enum OpenAIModel {
  GPT4 = "gpt-4",
  GPT432K = "gpt-4-32k",
  GPT35Turbo = "gpt-3.5-turbo",
  GPT3516K = "gpt-3.5-turbo-16k",
}
