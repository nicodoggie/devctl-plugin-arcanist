module.exports = {
  name: "arc:accept",
  run: async (toolbox) => {
    const {
      print: { info },
      prompt: { ask },
      parameters: { first },
      config: { arcanist },
      Conduit,
    } = toolbox;

    const { phabUri, token } = arcanist;
    const conduit = new Conduit(phabUri, token);

    const diff = await (async () => {
      if (first) {
        return first;
      }
      const { diff } = await ask({
        name: "diff",
        type: "input",
        message: "Which differential to review?",
        validate: function (value) {
          console.log(value);
          return true;
        },
      });

      return diff;
    })();

    info(await conduit.review(diff, "accept"));
  },
};
