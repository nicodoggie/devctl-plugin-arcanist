module.exports = {
  name: "arc:patchland",
  run: async (toolbox) => {
    const {
      print: { info },
      prompt: { ask },
      parameters: { first },
    } = toolbox;

    const { execSync } = require("child_process");

    const options = { cwd, stdio: "inherit" };
    const cwd = process.cwd();

    const diff = await (async () => {
      if (first) {
        return first;
      }
      const { diff } = await ask({
        name: "diff",
        type: "input",
        message: "Which differential to apply and land?",
        validate: function (value) {
          console.log(value);
          return true;
        },
      });

      return diff;
    })();

    execSync(`arc patch ${diff}`, options);
    execSync(`devctl arc:accept ${diff}`, options);
    execSync(`arc land`, options);
  },
};
