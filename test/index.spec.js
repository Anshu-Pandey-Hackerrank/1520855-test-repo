const io = require("socket.io-client");
const http = require("http");
const assert = require("assert");
const app = require("express")();
const port = process.env.PORT || 8000;
const randomWords = require("random-words");

before(() => {
  const wsServer = require("../app");
  const server = http.createServer(app);
  wsServer(server);
  server.listen(port);
});

function createClient() {
  const client = io.connect(`http://localhost:${port}`);

  return client;
}

function emitPublicMessage(client, publicMessage, username) {
  client.emit("public-message", { message: publicMessage, username });
}

function emitPrivateMessage(client, privateRoom, privateMessage, username) {
  client.emit("private-message", {
    room: privateRoom,
    message: privateMessage,
    username: username,
  });
}

function joinRoom(client, privateRoom) {
  client.emit("join-room", privateRoom);
}

describe("Chat Server Tests", () => {
  describe("Send Public messages - ", () => {
    const randomMessages = randomWords({
      exactly: 2,
      maxLength: 10,
    });
    it("#1 - should broadcast public messages send by client1 to all clients", (done) => {
      const client1 = createClient();
      const client2 = createClient();
      emitPublicMessage(client1, randomMessages[0], "user1");

      client2.on("public-message", (data) => {
        assert.strictEqual(data.message, randomMessages[0]);
        assert.strictEqual(data.username, "user1");
        client1.disconnect();
        client2.disconnect();
        done();
      });
    });

    it("#2 - should broadcast public messages send by client2 to all clients", (done) => {
      const client1 = createClient();
      const client2 = createClient();
      emitPublicMessage(client2, randomMessages[1], "user2");
      client1.on("public-message", (data) => {
        assert.strictEqual(data.message, randomMessages[1]);
        assert.strictEqual(data.username, "user2");
        client1.disconnect();
        client2.disconnect();
        done();
      });
    });

    it("#3 - should emit error on sending empty message by client1", (done) => {
      const client1 = createClient();
      const client2 = createClient();
      emitPublicMessage(client1, "", "user1");

      client1.on("error", (error) => {
        assert.strictEqual(error.message, "Invalid message");
        client1.disconnect();
        client2.disconnect();
        done();
      });
    });

    it("#4 - should emit error on sending invalid message type by client1", (done) => {
      const client1 = createClient();
      const client2 = createClient();
      emitPublicMessage(client1, 122121, "user1");

      client1.on("error", (error) => {
        assert.strictEqual(error.message, "Invalid message");
        client1.disconnect();
        client2.disconnect();
        done();
      });
    });

    it("#5 - should emit error on sending message of length greater than 10 by client1", (done) => {
      const client1 = createClient();
      const client2 = createClient();
      emitPublicMessage(client1, "12345678910", "user1");

      client1.on("error", (error) => {
        assert.strictEqual(error.message, "Invalid message");
        client1.disconnect();
        client2.disconnect();
        done();
      });
    });
  });

  describe("Send Private messages - ", () => {
    const randomMessages = randomWords({
      exactly: 2,
      maxLength: 10,
    });
    it("#1 - should send private message to the correct client from client1", (done) => {
      const client1 = createClient();
      const client2 = createClient();
      const privateRoom = `channel-${randomWords()}`;
      joinRoom(client1, privateRoom);
      joinRoom(client2, privateRoom);

      emitPrivateMessage(client1, privateRoom, randomMessages[0], "user1");

      client2.on("private-message", (data) => {
        assert.strictEqual(data.message, randomMessages[0]);
        assert.strictEqual(data.username, "user1");
        client1.disconnect();
        client2.disconnect();
        done();
      });
    });

    it("#2 - should send private message to the correct client from client2", (done) => {
      const client1 = createClient();
      const client2 = createClient();
      const privateRoom = `channel-${randomWords()}`;
      joinRoom(client1, privateRoom);
      joinRoom(client2, privateRoom);

      emitPrivateMessage(client2, privateRoom, randomMessages[1], "user2");

      client1.on("private-message", (data) => {
        assert.strictEqual(data.message, randomMessages[1]);
        assert.strictEqual(data.username, "user2");
        client1.disconnect();
        client2.disconnect();
        done();
      });
    });

    it("#3 - should emit error on sending empty message by client1", (done) => {
      const client1 = createClient();
      const client2 = createClient();
      const privateRoom = `channel-${randomWords()}`;
      joinRoom(client1, privateRoom);
      joinRoom(client2, privateRoom);

      emitPrivateMessage(client1, privateRoom, "", "user1");

      client1.on("error", (error) => {
        assert.strictEqual(error.message, "Invalid message");
        client1.disconnect();
        client2.disconnect();
        done();
      });
    });

    it("#4 - should emit error on sending invalid message type by client1", (done) => {
      const client1 = createClient();
      const client2 = createClient();
      const privateRoom = `channel-${randomWords()}`;
      joinRoom(client1, privateRoom);
      joinRoom(client2, privateRoom);

      emitPrivateMessage(client1, privateRoom, 735e7356, "user1");

      client1.on("error", (error) => {
        assert.strictEqual(error.message, "Invalid message");
        client1.disconnect();
        client2.disconnect();
        done();
      });
    });

    it("#5 - should emit error on sending message of length greater than 10 by client1", (done) => {
      const client1 = createClient();
      const client2 = createClient();
      const privateRoom = `channel-${randomWords()}`;
      joinRoom(client1, privateRoom);
      joinRoom(client2, privateRoom);

      emitPrivateMessage(client1, privateRoom, "12345678910", "user1");

      client1.on("error", (error) => {
        assert.strictEqual(error.message, "Invalid message");
        client1.disconnect();
        client2.disconnect();
        done();
      });
    });
  });
});
