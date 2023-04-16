import { createServer } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { Manager, Socket as ClientSocket } from "socket.io-client";

describe("my awesome project", () => {
  let io: SocketServer, serverSocket: Socket, clientSocket: ClientSocket;

  beforeAll((done) => {
    const httpServer = createServer();
    io = new SocketServer(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      io.on("connection", (socket) => {
        serverSocket = socket;
      });
      clientSocket = new Manager(`http://localhost:${port}`).socket("/");
      clientSocket.on("connect", done);
    });
  });

  afterAll(() => {
    io.close();
    clientSocket.close();
  });

  test("should work", (done) => {
    clientSocket.on("hello", (arg: any) => {
      expect(arg).toBe("world");
      done();
    });
    serverSocket.emit("hello", "world");
  });

  test("should work (with ack)", (done) => {
    serverSocket.on("hi", (cb) => {
      cb("hola");
    });
    clientSocket.emit("hi", (arg: any) => {
      expect(arg).toBe("hola");
      done();
    });
  });
});
