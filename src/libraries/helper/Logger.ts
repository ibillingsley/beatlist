const isDevelopment = process.env.NODE_ENV !== "production";

function debug(message: string, name?: string) {
  if (!isDevelopment) {
    return;
  }

  console.log(
    `${new Date().toISOString()}: ${name != null ? `[${name}] ` : ""}${message}`
  );
}

export default { debug };
