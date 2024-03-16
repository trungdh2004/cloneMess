const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
require("dotenv").config();
const mongoose = require("mongoose");
const Document = require("./document");

mongoose.connect("mongodb://localhost/ggdoc").then(() => {
  console.log("Connec");
});

app.get("/", (req, res) => {
  res.send("hihi");
});
const defaultValue = "";
io.on("connection", (socket) => {
  socket.on("get-document", async (room) => {
    const document = await findOrCreateDocument(room);
    console.log(document.data);
    socket.join(room);
    socket.emit("load-document", document.data);

    socket.on("send-changes", (detail) => {
      socket.broadcast.to(room).emit("recesiver-changes", detail);
    });

    socket.on("save-document", async (data) => {
      await Document.findByIdAndUpdate(room, {
        data,
      });
    });
  });
});

async function findOrCreateDocument(id) {
  if (id == null) return;

  const document = await Document.findById(id);
  if (document) return document;
  return await Document.create({ _id: id, data: defaultValue });
}

server.listen(3001, () => {
  console.log("listening on http://localhost:3001");
});
