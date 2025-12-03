// Ad strategy full flow temporarily disabled. This endpoint now returns a static response and performs no side effects.

exports.handler = async () => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      status: "disabled",
      message: "Ad strategy full flow has been disabled temporarily.",
    }),
  };
};
