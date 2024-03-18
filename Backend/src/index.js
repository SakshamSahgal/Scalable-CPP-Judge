require("dotenv").config()
const port = process.env.PORT || 8080
const path = require("path");
const { app } = require("./app");
const { RunCpp, DeleteAfterExecution } = require("./Run")


app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})

app.get("/run", (req, res) => {
  console.log("Got Request")
  RunCpp(req.body.code, req.body.input).then((result) => {
    console.log(result);
    res.send(result)
  })
})


// app.get("/testscript", (req, res) => {
//   //run the script in ShellTesting/script.sh
//   const { execFile } = require('child_process');
//   const child = execFile('/bin/bash', [path.join(__dirname,"script.sh")], (error, stdout, stderr) => {
//     if (error) {
//       throw error;
//     }
//     console.log(stdout);
//   });
// })