tell application "System Events"
    set _P to a reference to (processes whose name is "Raycast")
    set _W to a reference to windows of _P
    [_P's name, _W's name, _W's position, _W's size]
end tell