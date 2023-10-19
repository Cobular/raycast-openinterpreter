import requests
import interpreter
import sys
import json
import os

print(sys.executable, flush=True, file=sys.stderr)

interpreter.model = os.environ.get("MODEL", "gpt-3.5-turbo")
interpreter.auto_run = False
interpreter.max_budget = os.environ.get("MAX_BUDGET", 100)

while True:
    command = input() # Get the next command
    print("Executing command...", flush=True, file=sys.stderr)
    res = interpreter.chat(command, display=False, stream=True) # Executes a single command
    for chunk in res:
        print(json.dumps(chunk) + "\n", flush=True)
    # print("Command executed!" + json.dumps(res), flush=True, file=sys.stderr)
