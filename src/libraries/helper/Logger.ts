const isDevelopment = process.env.NODE_ENV !== "production";

function isDebugEnabled() {
  return isDevelopment;
}

function createMessage(message: string, name?: string) {
  return `${new Date().toISOString()}: ${
    name != null ? `[${name}] ` : ""
  }${message}`;
}

function warn(message: string, name?: string) {
  console.warn(createMessage(message, name));
}

function debug(message: string, name?: string) {
  if (!isDevelopment) {
    return;
  }

  console.log(createMessage(message, name));
}

export default { warn, debug, isDebugEnabled };
