import { Action, ActionPanel, List, clearSearchBar, getPreferenceValues } from "@raycast/api";
import { spawn, execSync } from "child_process";
import { join } from "path";
import { environment } from "@raycast/api";
import { Subject } from "rxjs";
import { useEffect, useState } from "react";
import { StreamParser } from "./utils/python_handlers";
import { OpenInterpreterPreferences } from "./utils/types";

function ConverseWithInterpretrer(): [(input: string) => void, Subject<string>, () => void] {
  const pythonInterpreterPath = join(environment.assetsPath, "venv/bin/python");
  const pythonCommandPath = join(environment.assetsPath, "py-src/main.py");
  execSync(`chmod +x ${pythonInterpreterPath}`);

  const preferences = getPreferenceValues<OpenInterpreterPreferences>();

  const env: Record<string, string> = {
    OPENAI_API_KEY: preferences["openinterpreter-openai-api-key"],
    MODEL: preferences["openinterpreter-openai-model"],
  };

  if (preferences["openinterpreter-openai-budget"] !== undefined) {
    env["BUDGET"] = preferences["openinterpreter-openai-budget"].toString();
  }

  const python_interpreter = spawn(pythonInterpreterPath, [pythonCommandPath], {
    env,
    stdio: "pipe",
    shell: true,
  });

  python_interpreter.stdout.setEncoding("utf8");
  python_interpreter.stderr.setEncoding("utf8");

  const output$ = new Subject<string>();

  python_interpreter.stdout.on("data", (chunk) => {
    output$.next(chunk.toString());
  });

  python_interpreter.stderr.on("data", (data) => {
    console.error(`stderr: ${data}`);
  });

  python_interpreter.on("close", (code) => {
    console.log(`child process exited with code ${code}`);
  });

  const sendInput = (input: string) => {
    python_interpreter.stdin.write(input + "\n");
  };

  const kill_fn = () => {
    console.log("Killing python interpreter");
    python_interpreter.kill();
  };

  return [sendInput, output$, kill_fn];
}

export default function Command() {
  const [sendInput, setSendInput] = useState<(input: string) => void>();
  const [output, setOutput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [streamParser, setStreamParser] = useState<StreamParser>();
  const [killFn, setKillFn] = useState<() => void>();

  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    const [sendInput, output$, kill_fn] = ConverseWithInterpretrer();
    setSendInput(() => sendInput);
    setKillFn(() => () => {
      kill_fn();
      setLoading(false);
      setSearchText("Killed, please try again.");
    });

    const this_stream_parser = new StreamParser(setOutput, setLoading);
    setStreamParser(() => this_stream_parser);

    const subscription = output$.subscribe({
      next: (data) => {
        console.log(data);
        data
          .split("\n")
          .filter((line) => line !== "")
          .forEach((line) => this_stream_parser.update(JSON.parse(line)));
      },
      error: (err) => console.error(`Something went wrong: ${err}`),
    });

    return () => {
      subscription.unsubscribe();
      kill_fn();
    };
  }, []);

  const actions = (
    <ActionPanel title="Actions">
      <Action
        title="Send"
        autoFocus
        onAction={() => {
          if (searchText === "") return;
          sendInput?.(searchText);
          streamParser?.user_question(searchText);
          clearSearchBar();
        }}
      />
      <Action
        title="Clear"
        onAction={() => {
          clearSearchBar();
        }}
      />
      <Action
        title="Kill"
        onAction={() => {
          killFn?.();
        }}
      />
    </ActionPanel>
  );

  return (
    <List
      navigationTitle="Talk to OpenInterpreter"
      searchBarPlaceholder={loading ? "Loading..." : "Ask a question..."}
      isLoading={loading}
      onSearchTextChange={(text) => {
        setSearchText(text);
      }}
      isShowingDetail={true}
      actions={actions}
    >
      <List.Item title={"Module Response"} detail={<List.Item.Detail markdown={output} />} actions={actions} />
    </List>
  );
}
