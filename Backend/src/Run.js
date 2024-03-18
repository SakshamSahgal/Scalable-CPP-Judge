const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { execFile } = require('child_process');

function DeleteAfterExecution(JobId, ...filePaths) {
    filePaths.forEach(filePath => {
        fs.unlink(filePath, (err) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    console.log(`File ${filePath} does not exist`);
                    WriteLogsToFile(`File ${filePath} does not exist`, JobId);
                } else {
                    console.log(`Error occurred while deleting the ${filePath} file, err : ${err}`);
                    WriteLogsToFile(`Error occurred while deleting the ${filePath} file, err : ${err}`, JobId);
                }
            } else {
                console.log(`Successfully deleted the ${filePath} file`);
                WriteLogsToFile(`Successfully deleted the ${filePath} file`, JobId);
            }
        });
    });
}

async function WriteLogsToFile(logs, JobId) {
    logs += "\n";
    let logFilePath = path.join(__dirname, "..", "public", `${JobId}Logs.txt`)
    //append the logs to the logs file
    fs.appendFile(logFilePath, logs, (err) => {
        if (err) {
            console.log(`error while appending logs to the logs file, err : ${err}`);
        }
    });
}

//this route will be used to run the c++ code
//it first takes the code and input in body of the request
//Then it writes the code to a .cpp file
//Then it compiles and runs the .cpp file
//Then it passes the input to the stdin of the running script
//Then it writes the output to a .txt file



async function writeCppToFile(code, scriptPath, JobId) {
    return new Promise((resolve, reject) => {
        fs.writeFile(scriptPath, code, (err) => {
            if (err) {
                console.log(`Error occurred while writing the ${filename} file, err : ${err}`);
                WriteLogsToFile(`Error occurred while writing the ${filename} file, err : ${err}`, JobId);
                reject(err);
            } else {
                console.log(`Successfully written the ${scriptPath} file`);
                WriteLogsToFile(`Successfully written the ${scriptPath} file`, JobId);
                resolve();
            }
        });
    });
}


async function runCommand(command, JobId) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.log(`Error occurred while running the command ${command}, err : ${error}`);
                WriteLogsToFile(`Error occurred while running the command ${command}, err : ${error}`, JobId);
                reject(error);
                return;
            }
            if (stderr) {
                console.log(`Error occurred while running the command ${command}, stderr : ${stderr}`);
                WriteLogsToFile(`Error occurred while running the command ${command}, stderr : ${stderr}`, JobId);
                reject(new Error(stderr));
                return;
            }
            console.log(`Successfully ran the command ${command}`);
            // Extract the exit code from the error object if it exists
            const exitCode = error ? error.code : 0;
            resolve(exitCode);
        });
    });
}



//Possible Responses - 
//{ success: false, message: `script took too long to execute.`, verdict: "Time Limit Exceeded" }
//{ success: false, message: `Error occurred while writing the ${scriptPath} file`, verdict: "Runtime Error" }
//{ success: false, message: `Error occurred while appending data to the ${outputFilePath} file`, verdict: "Runtime Error" }
//{ success: false, message: `Error occured while running the script ${executablePath}`, verdict: "Compilation Error" }
//{ success: false, message: `Output File size exceeds ${(process.env.MemoryLimitForCodeInBytes / (1024 * 1024))} MB`, verdict: "Memory Limit Exceeded" }
//{ success: true, outputFilePath: outputFilePath, verdict: "Run Successful" }

async function RunCpp(code, input, TimeLimit = 5) {
    return new Promise(async (resolve, reject) => {

        let scriptName = Date.now();
        let JobId = scriptName;
        let scriptPath = path.join(__dirname, `${scriptName}.cpp`)
        let executablePath = path.join(__dirname, `${scriptName}`)
        let outputFilePath = path.join(__dirname, `${scriptName}.txt`)


        //write the code to a .cpp file asychronously
        try {
            await writeCppToFile(code, scriptPath, JobId);
            try {
                //compile the .cpp file into an executable file
                await runCommand(`g++ ${scriptPath} -o ${executablePath}`, JobId);

                try {

                    try {
                        scriptArguments = [executablePath, outputFilePath, TimeLimit, process.env.MemoryLimitForOutputFileInBytes];
                        const child = execFile('/bin/bash', [path.join(__dirname, "script.sh"), ...scriptArguments], (error, stdout, stderr) => {
                            if (error) {
                                console.log(`Exit code: ${error.code}`); // Log the exit code
                                if (error.code === 1) {
                                    resolve({
                                        success: false,
                                        message: `Error occured while running the script ${executablePath}`,
                                        verdict: "Runtime Error"
                                    });
                                }
                                if (error.code === 2) {
                                    resolve({
                                        success: false,
                                        message: `script took too long to execute.`,
                                        verdict: "Time Limit Exceeded"
                                    });
                                }
                                else { //exit code 3
                                    resolve({
                                        success: false,
                                        message: `Output File size exceeds ${(process.env.MemoryLimitForOutputFileInBytes / (1024 * 1024))} MB`,
                                        verdict: "Memory Limit Exceeded"
                                    });
                                }
                                DeleteAfterExecution(JobId, scriptPath, executablePath);
                            }
                            else {
                                resolve({
                                    success: true,
                                    outputFilePath: outputFilePath,
                                    verdict: "Run Successful"
                                });
                                DeleteAfterExecution(JobId, scriptPath, executablePath);
                            }
                        });
                    }
                    catch (err) {
                        reject({
                            success: false,
                            message: `Error occurred while running the command ${command}, err : ${err}`,
                            verdict: "Compilation Error"
                        });
                        DeleteAfterExecution(JobId, scriptPath, executablePath);
                        return;
                    }


                } catch (err) {
                    reject({
                        success: false,
                        message: `Error occurred while running the command ${command}, err : ${err}`,
                        verdict: "Compilation Error"
                    });
                    DeleteAfterExecution(JobId, scriptPath, executablePath);
                    return;
                }

            } catch (err) {
                reject({
                    success: false,
                    message: `Error occured while running the script ${executablePath}`,
                    verdict: "Compilation Error"
                });
                DeleteAfterExecution(JobId, scriptPath, executablePath);
                return;
            }

        } catch (err) {
            reject({
                success: false,
                message: `Error occured while running the script ${executablePath}`,
                verdict: "Compilation Error"
            });
            DeleteAfterExecution(JobId, executablePath, scriptPath);
            return;
        }
    });
}


module.exports = { RunCpp, DeleteAfterExecution };