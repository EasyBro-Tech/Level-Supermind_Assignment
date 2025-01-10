const protocol = window.location.protocol; // 'http:' or 'https:'
const hostname = window.location.hostname; // 'localhost', 'example.com'
const port = window.location.port; // '3000', '8080', ''
let serverUrldefault = "http://localhost:7000";

if (hostname != "localhost") {
  serverUrldefault = `${protocol}//${hostname}:${port}`;
}

// if (port == 7000) {
//   serverUrldefault = `${protocol}//${hostname}:7000}`;
// }

export const serverUrl = serverUrldefault;
