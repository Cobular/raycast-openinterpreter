#!/usr/bin/env python3

import interpreter
import sys
import json

interpreter.model = "gpt-3.5-turbo"
interpreter.auto_run = False
interpreter.max_budget = 1

while True:
    command = input() # Get the next command
    print("Executing command...", flush=True, file=sys.stderr)
    res = interpreter.chat(command, display=False, stream=True) # Executes a single command
    for chunk in res:
        print(json.dumps(chunk) + "\n", flush=True)
    # print("Command executed!" + json.dumps(res), flush=True, file=sys.stderr)
