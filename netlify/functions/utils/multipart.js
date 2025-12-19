import Busboy from "busboy";

export async function parseMultipart(event, options = {}) {
  const maxFileSizeBytes = options.maxFileSizeBytes ?? 10 * 1024 * 1024;

  const headers = event?.headers || {};
  const contentType = headers["content-type"] || headers["Content-Type"];
  if (!contentType?.startsWith("multipart/form-data")) {
    throw new Error("Expected multipart/form-data");
  }

  const bodyBuffer = event?.body
    ? Buffer.from(event.body, event.isBase64Encoded ? "base64" : "utf8")
    : Buffer.alloc(0);

  return await new Promise((resolve, reject) => {
    const fields = {};
    const files = {};

    const bb = Busboy({
      headers: { "content-type": contentType },
      limits: { fileSize: maxFileSizeBytes, files: 1, fields: 50 },
    });

    bb.on("field", (name, val) => {
      fields[name] = val;
    });

    bb.on("file", (name, stream, info) => {
      const { filename, mimeType } = info;
      const chunks = [];
      let size = 0;

      stream.on("data", (d) => {
        size += d.length;
        chunks.push(d);
      });

      stream.on("limit", () => {
        reject(new Error(`File too large (max ${maxFileSizeBytes} bytes)`));
      });

      stream.on("end", () => {
        files[name] = {
          filename: filename || "upload",
          contentType: mimeType || "application/octet-stream",
          size,
          buffer: Buffer.concat(chunks),
        };
      });
    });

    bb.on("error", (err) => reject(err));
    bb.on("finish", () => resolve({ fields, files }));

    bb.end(bodyBuffer);
  });
}

