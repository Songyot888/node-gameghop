import { app } from './app';
import http from "http";

const port = process.env.port ||  3000;
const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server is started on port ${port}`);
},).on("error", (error) => {
  console.error(error);
});