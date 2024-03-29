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

const dailyLog = createLogger({
  exitOnError: false,
  transports: [dailyTransport],
});

export let log = createLogger({
  exitOnError: false,
  transports: [dailyTransport, consoleTransport],
});

process.on("unhandledRejection", (err) => {
  dailyLog.error(err);
  throw err;
});
