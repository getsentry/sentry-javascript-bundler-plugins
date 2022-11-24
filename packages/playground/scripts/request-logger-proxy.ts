import express from "express";
import httpProxy from "http-proxy";
import fs from "fs";
import path from "path";

const now = Date.now();

var app = express();

var proxy = httpProxy.createProxyServer();

app.use(function (req, res, next) {
  let reqBody: Uint8Array[] = [];
  let resBody: Uint8Array[] = [];
  let reqLog: string;

  req
    .on("data", (chunk: Buffer) => {
      reqBody.push(chunk);
    })
    .on("end", () => {
      reqLog = `Path: ${req.method} ${req.path}\nRequest headers: ${JSON.stringify(
        req.headers,
        null,
        2
      )}\nRequest body:\n${Buffer.concat(reqBody).toString()}`;
    });

  var oldWrite = res.write,
    oldEnd = res.end;

  res.write = function (chunk: Buffer) {
    resBody.push(chunk);

    // @ts-ignore
    return oldWrite.apply(res, arguments);
  };

  // @ts-ignore
  res.end = function (chunk) {
    if (chunk) resBody.push(chunk);

    const resLog = `Response status: ${res.statusCode}\nResponse headers: ${JSON.stringify(
      res.getHeaders(),
      null,
      2
    )}\nResponse body:\n${Buffer.concat(resBody).toString()}`;

    fs.appendFileSync(
      path.join(__dirname, "request-logger-logs", `${now}.txt`),
      `>>>>>>>>>\n\n${reqLog}\n\n-----------\n\n${resLog}\n\n<<<<<<<<<\n\n`,
      {
        encoding: "utf-8",
      }
    );

    // @ts-ignore
    oldEnd.apply(res, arguments);
  };

  next();
});

app.use(function (req, res, next) {
  proxy.web(
    req,
    res,
    {
      target: "https://sentry.io", // change this if you want to proxy to another target
      changeOrigin: true,
    },
    next
  );
});

app.listen(8005, function () {
  console.log("Listening!");
});
