const express = require('express');
const cors = require('cors');
const {nanoid} = require('nanoid');

const expressWs = require('express-ws');

const app = express();
const port = 8000;

expressWs(app);

app.use(cors());
app.use(express.json());

const connections = {};
const pictures = [];
let color;

app.ws('/draw', function (ws, req) {
   console.log('Client connected!');

   const id = nanoid();

   connections[id] = ws;

   console.log('Total clients connections ', Object.keys(connections).length);

   ws.send(JSON.stringify({
      type: 'LAST_PICTURES',
      pictures: pictures
   }));

   ws.on('message', (msg) => {
      console.log(`Incoming message from ${id} , ${msg}`);

      const parsed = JSON.parse(msg);
      switch (parsed.type) {
         case 'CREATE_PICTURE':
            Object.keys(connections).forEach(connId => {
               const connection = connections[connId];
               const newMessage = {x: parsed.x, y: parsed.y, color};
               connection.send(JSON.stringify({
                  type: 'NEW_PICTURE',
                  ...newMessage
               }));
               pictures.push(newMessage);
            });
            break;
         case 'COLOR_CHANGER':
            color = parsed.color;
            break;
         default:
            console.log('No type' + parsed.type)
      }
   });

   ws.on('close', (msg) => {
      console.log(`client disconnected id = ${id}`);

      delete connections[id]
   })

});

app.listen(port, () => {
   console.log(`Server started on ${port} port!`)
});