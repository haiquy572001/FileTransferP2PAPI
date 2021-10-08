const express = require("express");
const WebSocket = require("ws");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const wsServer = new WebSocket.Server({ noServer: true });


let persons = [];
wsServer.on("connection", socket => {
  console.log("have connect");
  persons.push(socket);

  let id = persons.length - 1;
  let data = {
    type: "INIT",
    id: id
  }
  persons[id].send(JSON.stringify(data));
});

app.post('/', (req, res) => {
  console.log(req.body);
  connectId(req.body);
  return res.send();
})

function connectId(data) {

  let message = {
    type: data.type,
    idConnect: data.idPerson,
    iceConnect: data.icePerson
  }
  persons[data.idConnect].send(JSON.stringify(message));

}


const server = app.listen(3000);
server.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request);
  });
});