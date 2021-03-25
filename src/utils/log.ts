import {PluginDefinition} from "apollo-server-core";
import path from "path";
import {createLogger, format, transports} from "winston";
import "winston-daily-rotate-file";

export {Logger} from "winston";

const dailyTransport = new transports.DailyRotateFile({
  level: "info",
  filename: path.join("logs", "application-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  handleExceptions: true,
  format: format.combine(
    format.timestamp({format: "HH:mm:ss"}),
    format.json(),
    // format.prettyPrint(),
    // format.printf(
    //   (info) =>
    //     `[${info.timestamp} ${info.level.toUpperCase()}] ${JSON.stringify(
    //       info.message,
    //     )}`,
    // ),
  ),
});

const consoleTransport = new transports.Console({
  level: "debug",
  handleExceptions: true,
  format: format.combine(
    format.timestamp({format: "HH:mm:ss"}),
    format.prettyPrint(),
    format.printf(
      (info) => `[${info.timestamp} ${info.level}] ${info.message}`,
    ),
    format.colorize({all: true}),
  ),
});

export let log = createLogger({
  exitOnError: false,
  transports: [dailyTransport, consoleTransport],
});

process.on("unhandledRejection", (err) => {
  throw err;
});

// (async () => {
//   throw new Error("Error message async!");
// })();

// (() => {
//   log.info("info with meta", {yow: "the metas", arr: [1, 2, "test"]});
//   throw new Error("Error message sync!");
// })();

export const logExtension: PluginDefinition = {
  requestDidStart() {
    return {
      didEncounterErrors(ctx) {
        for (const error of ctx.errors) {
          log.error(JSON.stringify(error) + "\n" + error.stack);
        }
      },
    };
  },
};
