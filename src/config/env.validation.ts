type Env = Record<string, string | undefined>;

export function validateEnv(config: Env): Env {
  const required = [
    'DB_HOST',
    'DB_PORT',
    'DB_USER',
    'DB_PASS',
    'DB_NAME',
    'MAIL_HOST',
    'MAIL_PORT',
    'MAIL_USER',
    'MAIL_PASS',
    'MAIL_FROM',
    'EMAIL_VERIFICATION_URL',
  ];

  const missing = required.filter((key) => !config[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }

  const dbPort = Number(config.DB_PORT);
  const mailPort = Number(config.MAIL_PORT);
  const dbConnectTimeout =
    config.DB_CONNECT_TIMEOUT !== undefined
      ? Number(config.DB_CONNECT_TIMEOUT)
      : undefined;
  const dbRequestTimeout =
    config.DB_REQUEST_TIMEOUT !== undefined
      ? Number(config.DB_REQUEST_TIMEOUT)
      : undefined;

  if (!Number.isInteger(dbPort) || dbPort <= 0) {
    throw new Error('DB_PORT must be a positive integer');
  }

  if (!Number.isInteger(mailPort) || mailPort <= 0) {
    throw new Error('MAIL_PORT must be a positive integer');
  }

  if (
    dbConnectTimeout !== undefined &&
    (!Number.isInteger(dbConnectTimeout) || dbConnectTimeout <= 0)
  ) {
    throw new Error('DB_CONNECT_TIMEOUT must be a positive integer');
  }

  if (
    dbRequestTimeout !== undefined &&
    (!Number.isInteger(dbRequestTimeout) || dbRequestTimeout <= 0)
  ) {
    throw new Error('DB_REQUEST_TIMEOUT must be a positive integer');
  }

  if (
    config.NODE_ENV &&
    !['development', 'test', 'production'].includes(config.NODE_ENV)
  ) {
    throw new Error('NODE_ENV must be one of development, test, production');
  }

  if (
    config.MAIL_TLS_REJECT_UNAUTHORIZED &&
    !['true', 'false', '1', '0'].includes(config.MAIL_TLS_REJECT_UNAUTHORIZED)
  ) {
    throw new Error('MAIL_TLS_REJECT_UNAUTHORIZED must be a boolean string');
  }

  if (
    config.DB_SSL_REJECT_UNAUTHORIZED &&
    !['true', 'false', '1', '0'].includes(config.DB_SSL_REJECT_UNAUTHORIZED)
  ) {
    throw new Error('DB_SSL_REJECT_UNAUTHORIZED must be a boolean string');
  }

  if (
    config.DB_DIALECT &&
    !['postgres', 'mssql'].includes(config.DB_DIALECT)
  ) {
    throw new Error('DB_DIALECT must be one of: postgres, mssql');
  }

  if (config.KAFKA_BROKERS) {
    const brokers = config.KAFKA_BROKERS.split(',')
      .map((broker) => broker.trim())
      .filter(Boolean);
    if (brokers.length === 0) {
      throw new Error('KAFKA_BROKERS must include at least one broker');
    }
  }

  return config;
}
