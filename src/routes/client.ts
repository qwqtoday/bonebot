import { Router } from "express";
import { app } from "../app";
import { ClientManager, ClientManagerError } from "../manager";

const client_router: Router = Router();

client_router.post("/start/:name", (req, res) => {
  const name = req.params.name;

  const clientManager: ClientManager = app.get("client manager");

  try {
    clientManager.start(name);
  } catch (err) {
    if (!(err instanceof ClientManagerError)) {
      res.status(500).json({
        message: "Internal server error.",
      });
      return;
    }
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }

  res.status(200).json({
    message: "Successfully started client.",
  });
});

client_router.post("/stop/:name", (req, res) => {
  const name = req.params.name;

  const clientManager: ClientManager = app.get("client manager");

  try {
    clientManager.stop(name);
  } catch (err) {
    if (!(err instanceof ClientManagerError)) {
      res.status(500).json({
        message: "Internal server error.",
      });
      return;
    }
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }

  res.status(200).json({
    message: "Successfully stopped client.",
  });
});

client_router.get("/info/:name", (req, res) => {
  const name = req.params.name;

  const clientManager: ClientManager = app.get("client manager");

  try {
    const info = clientManager.getInfo(name);
    res.status(200).json(info);
  } catch (err) {
    if (!(err instanceof ClientManagerError)) {
      res.status(500).json({
        message: "Internal server error.",
      });
      return;
    }
    res.status(err.statusCode).json({
      message: err.message,
    });
    return;
  }
});

client_router.post("/execute-command/:name", (req, res) => {
  if (req.headers["content-type"] != "application/json") {
    res.status(415).json({
      message: "content-type can be only application/json",
    });
    return;
  }

  const name = req.params.name;
  const command = req.body.command;
  const args = req.body.args;

  const clientManager: ClientManager = app.get("client manager");

  try {
    clientManager.executeCommand(name, command, args);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
    return;
  }
  res.status(200).json({
    message: "sent command.",
  });
});

client_router.get("/list/", (req, res) => {
  const clientManager: ClientManager = app.get("client manager");

  let clientNames = [];
  for (let client of clientManager.clients.keys()) {
    clientNames.push(client);
  }

  res.status(200).json(clientNames);
});

export default client_router;
