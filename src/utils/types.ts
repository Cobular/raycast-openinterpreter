export interface OpenInterpreterPreferences {
  "openinterpreter-openai-api-key": string;
  "openinterpreter-openai-model": OpenAIModel;
  "openinterpreter-openai-budget"?: number;
  "openinterpreter-openai-base-url"?: string;
}

export enum OpenAIModel {
  GPT4 = "gpt-4",
  GPT432K = "gpt-4-32k",
  GPT35Turbo = "gpt-3.5-turbo",
  GPT3516K = "gpt-3.5-turbo-16k",
}


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function assertUnreachable(_: never): never {
  throw new Error("Didn't expect to get here");
}
