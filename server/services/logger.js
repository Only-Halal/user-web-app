const winston = require("winston");
const CloudWatchTransport = require("winston-cloudwatch");

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const logger = winston.createLogger({
  levels: logLevels,
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}] ${message} ${JSON.stringify(meta)}`;
        })
      ),
    }),
  ],
});

if (process.env.NODE_ENV === "production") {
  logger.add(
    new CloudWatchTransport({
      logGroupName: process.env.CLOUDWATCH_LOG_GROUP,
      logStreamName: process.env.CLOUDWATCH_LOG_STREAM,
      awsRegion: process.env.AWS_REGION,
      awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID,
      awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
      messageFormatter: ({ level, message, ...meta }) => {
        return JSON.stringify({
          level,
          message,
          ...meta,
        });
      },
    })
  );
}

module.exports = logger;
