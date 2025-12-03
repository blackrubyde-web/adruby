// Meta ads setup generation endpoint disabled. No external calls or database changes occur.

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "disabled",
      message: "Meta ads setup generation is currently disabled.",
    }),
  };
};
