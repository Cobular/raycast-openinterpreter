import interpreter
import sys
import json
import os

# Required to patch open-interpreter's check of the current python interpreter
# god Killian, why didn't you assume that I would bundle my entire environment into a single file?????? (jk ily)
sys.executable = "python3"

interpreter.model = os.environ.get("MODEL", "gpt-3.5-turbo")
interpreter.auto_run = True
interpreter.max_budget = os.environ.get("MAX_BUDGET", 100)

interpreter.system_message += "If using pip, be sure to invoke with `python3 -m pip` instead of `pip`.\nAlways say something before you run some code describing what you will do, even if it seems trivial."

while True:
    command = input() # Get the next command
    res = interpreter.chat(command, display=False, stream=True) # Executes a single command
    print(res, flush=True, file=sys.stderr)
    for chunk in res:
        print(json.dumps(chunk) + "\n", flush=True)
    print("Command finished", flush=True, file=sys.stderr)
    # print("Command executed!" + json.dumps(res), flush=True, file=sys.stderr)
