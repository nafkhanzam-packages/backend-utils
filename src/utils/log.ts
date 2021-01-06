import {GraphQLExtension} from "apollo-server-express";
import {GraphQLError} from "graphql";
import path from "path";
import {createLogger, format, transports} from "winston";
import "winston-daily-rotate-file";

export let log = createLogger({
  transports: [
    new transports.DailyRotateFile({
      level: "info",
      filename: path.join("logs", "application-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      format: format.combine(
        format.timestamp({format: "HH:mm:ss"}),
        format.prettyPrint(),
        format.printf(
          (info) =>
            `[${info.timestamp} ${info.level.toUpperCase()}] ${JSON.stringify(
              info.message,
            )}`,
        ),
      ),
    }),
    new transports.Console({
      level: "debug",
      format: format.combine(
        format.colorize({all: true}),
        format.timestamp({format: "HH:mm:ss"}),
        format.prettyPrint(),
        format.printf(
          (info) => `[${info.timestamp} ${info.level}] ${info.message}`,
        ),
      ),
    }),
  ],
});

export class LogExtension extends GraphQLExtension {
  didEncounterErrors(errors: GraphQLError[]) {
    for (const error of errors) {
      log.error(JSON.stringify(error) + "\n" + error.stack);
    }
  }
}
