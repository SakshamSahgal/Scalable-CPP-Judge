@echo off

echo "Starting the automation process"
REM Set the directory where you want to clone the repository
set "clone_directory=C:\Projects\test"
REM Set the URL of the Git repository you want to clone
set "repo_url=https://github.com/SakshamSahgal/SandboxenvironmentAutomation-node-react-"

GOTO:MAIN

REM Check if Git is installed
:CheckGitInstallation
	echo Checking if Git is installed...
	where git >nul 2>nul
	if %errorlevel% neq 0 (
		echo Git is not installed or not found in the system PATH.
		pause
		exit
	) else (
		echo Git is installed and found in the system PATH.
	)
exit /b 0

REM Clone the repository
:CloneRepository
	echo Cloning the repository...
	git clone %repo_url% %clone_directory%
	if %errorlevel% neq 0 (
		echo An error occurred while cloning the repository.
		pause
		exit
	) else (
		echo Repository cloned successfully.
	)
exit /b 0

:MAIN
echo "---------------------------------"
REM Call functions in sequence
call :CheckGitInstallation
echo "---------------------------------"
call :CloneRepository
echo "---------------------------------"

REM Pause to keep the command window open after execution (optional)
pause
