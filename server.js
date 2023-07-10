const express = require('express');
const fs = require('fs');
var bodyParser = require('body-parser');
const WebSocket = require('ws');
const readline = require('readline');
const { Socket } = require('dgram');
const { exec } = require('child_process');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const wss = new WebSocket.Server({ port: 42068 });
var decisionLogin = false

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function showYesNoDialog(question, callback) {
  rl.question(`${question} (y/n) `, (answer) => {
    const normalizedAnswer = answer.trim().toLowerCase();
    const isYes = normalizedAnswer === 'y' || normalizedAnswer === 'yes';
    callback(isYes);
  });
}

wss.on('connection', (ws) => {
  fs.appendFile('public/message.txt', "Client Connected\n", (err) => {
    if (err) {
      console.error('An error occurred while writing to the file:', err);
    } else {
      console.log('Content has been written to the file successfully.');
    }
  });

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
    message += "\n"
    decision = message.substring(-1, 6)

    if (decision === "Signup")
      message = message.substring(11, message.length)
    else if (decision === "Login ")
      message = message.substring(10, message.length)

    fs.appendFile('public/message.txt', decision + " for " + message, (err) => {
      if (err) {
        console.error('An error occurred while writing to the file:', err);
      } else {
        console.log('Content has been written to the file successfully.');
      }
    });

    if (decision === "Signup") {
      result = signup(message)

      if (result)
        ws.send("Successful Signup")
      else
        ws.send("Unsuccessful Signup")
    }
    else if (decision === "Login ") {
      console.log(decisionLogin + " Calling");
      login(message)
        .then((success) => {
          console.log(decisionLogin + " After Call");
          if (success)
            ws.send("Successful Login");
          else
            ws.send("Unsuccessful Login");
        })
        .catch((error) => {
          console.error('An error occurred while reading the file:', error);
          ws.send("Error occurred during login");
        });
    }

    decision = message.substring(-1, 7)
    console.log(decision)
    if(decision == "Request")
    {
      message = message.substring(10,message.length)
      message = message.split(",")

      data = "Name: "+message[0]+"\nExpiary Date: "+message[1]+"\nCVV: "+message[2,message.length-2]+"\n";

      showYesNoDialog(data, (isYes) => {
        if (isYes) {
          ws.send("Approved")
        } else {
          ws.send("Denied")
        } 
        rl.close();
      });
    }
  });
});

function signup(message) {
  const filePath = 'data.txt';
  fs.appendFile(filePath, message, (err) => {
    if (err) {
      console.error('An error occurred while appending the message:', err);
      return
    }
    console.log('Data Stored Successfully');
  });
  return true
}

function login(message) {
  return new Promise((resolve, reject) => {
    message = message.substring(-1, message.length - 1);

    const fileStream = fs.createReadStream('data.txt', 'utf8');
    let lineCount = 0;
    let flag = 0;

    fileStream.on('data', (chunk) => {
      const lines = chunk.split('\n');

      lines.forEach((line) => {
        lineCount++;
        if (line === message) {
          console.log(`Match found on line ${lineCount}: ${line}`);
          flag = 1;
        }
      });
    });

    fileStream.on('error', (err) => {
      reject(err);
    });

    fileStream.on('end', () => {
      if (flag === 1) {
        console.log('File reading completed.');
        decisionLogin = true;
        console.log(decisionLogin + " During Call");
        resolve(true);
      } else {
        console.log('File reading completed, but no match found.');
        resolve(false);
      }
    });
  });
}

app.get('/', (req, res) => {
  fs.appendFile('public/message.txt', "Client Connected \n", (err) => {
    if (err) {
      console.error('An error occurred while writing to the file:', err);
    } else {
      console.log('Content has been written to the file successfully.');
    }
  });
})

app.listen(42070)