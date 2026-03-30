@echo off
setlocal
set "NODE_EXE="
if exist "%ProgramFiles%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles%\nodejs\node.exe"
if not defined NODE_EXE if exist "%ProgramFiles(x86)%\nodejs\node.exe" set "NODE_EXE=%ProgramFiles(x86)%\nodejs\node.exe"
if not defined NODE_EXE (
  echo [hubspot.cmd] Node.js not found under Program Files. Install Node or fix PATH.
  exit /b 1
)
set "HS_JS=%AppData%\npm\node_modules\@hubspot\cli\bin\hs.js"
if not exist "%HS_JS%" (
  echo [hubspot.cmd] HubSpot CLI not found at:
  echo   %HS_JS%
  echo Run: npm install -g @hubspot/cli
  exit /b 1
)
"%NODE_EXE%" "%HS_JS%" %*
