export interface Language {
  language: string;
}

export interface CodeChunk {
  code?: string;
}

export interface LanguageChunk {
  language: string;
}

export interface ExecutingChunk {
  executing: {
    code: string;
    language: string;
  };
}

export interface ActiveLineChunk {
  active_line: number;
}

export interface OutputChunk {
  output: string;
}

export interface EndOfExecutionChunk {
  end_of_execution: boolean;
}

export interface MessageChunk {
  message: string;
}

type ResponseChunk = LanguageChunk | CodeChunk | ExecutingChunk | ActiveLineChunk | OutputChunk | EndOfExecutionChunk | MessageChunk;

export function isLanguageChunk(chunk: ResponseChunk): chunk is LanguageChunk {
  return (chunk as LanguageChunk).language !== undefined;
}

export function isCodeChunk(chunk: ResponseChunk): chunk is CodeChunk {
  return (chunk as CodeChunk).code !== undefined;
}

export function isExecutingChunk(chunk: ResponseChunk): chunk is ExecutingChunk {
  return (chunk as ExecutingChunk).executing !== undefined;
}

export function isActiveLineChunk(chunk: ResponseChunk): chunk is ActiveLineChunk {
  return (chunk as ActiveLineChunk).active_line !== undefined;
}

export function isOutputChunk(chunk: ResponseChunk): chunk is OutputChunk {
  return (chunk as OutputChunk).output !== undefined;
}

export function isEndOfExecutionChunk(chunk: ResponseChunk): chunk is EndOfExecutionChunk {
  return (chunk as EndOfExecutionChunk).end_of_execution !== undefined;
}

export function isMessageChunk(chunk: ResponseChunk): chunk is MessageChunk {
  return (chunk as MessageChunk).message !== undefined;
}


export class StreamParser {
  private content = '';
  private activeLine: number | null = null;
  private currentLanguage = '';
  private current_code = '';
  private responseContentHook: (content: string) => void;
  private loadingHook: (loading: boolean) => void;

  // Constructor that takes a hook to call with updated content
  constructor(responseContentHoook: (content: string) => void, loadingHook: (loading: boolean) => void) {
    this.responseContentHook = responseContentHoook;
    this.loadingHook = loadingHook;
  }

  user_question(question: string) {
    if (this.content !== '') {
      this.content += '\n * * * \n';
    }

    this.content += `You asked: **${question}**\n\n`;

    this.content += '\n * * * \n'

    this.responseContentHook(this.getContent());
    this.loadingHook(true);
  }

  update(chunk: ResponseChunk) {
    if (isLanguageChunk(chunk)) {
      this.currentLanguage = chunk.language;
    } else if (isCodeChunk(chunk)) {
      this.current_code += chunk.code;
    } else if (isExecutingChunk(chunk)) {
      this.current_code = chunk.executing.code;
    } else if (isActiveLineChunk(chunk)) {
      this.activeLine = chunk.active_line;
    } else if (isOutputChunk(chunk)) {
      this.content += `\n\n\`\`\`${this.currentLanguage}\n${this.current_code}\n\`\`\`\n\n`;
      this.current_code = '';
      // Strip any trailing newlines or whitespace from the output
      chunk.output = chunk.output.replace(/\s*$/, '');
      this.content += `Result: \`${chunk.output}\`\n\n`;
    } else if (isEndOfExecutionChunk(chunk)) {
      // We clean everything up in the output line;
      this.loadingHook(false);
    } else if (isMessageChunk(chunk)) {
      this.content += `${chunk.message}`;
    }

    this.responseContentHook(this.getContent());
  }

  getContent() {
    if (this.current_code !== '') {
      if (this.activeLine !== null) {
        const lines = this.current_code.split('\n');
        lines[this.activeLine - 1] = `**${lines[this.activeLine - 1]}**`;
        return this.content + `\n\`\`\`${this.currentLanguage}\n${lines.join('\n')}\n\`\`\``;
      }
      return this.content + `\n\`\`\`${this.currentLanguage}\n${this.current_code}\n\`\`\``;
    } else {
      return this.content;
    }
  }
}