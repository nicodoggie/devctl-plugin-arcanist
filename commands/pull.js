module.exports = {
  name: "arc:pull",
  run: async (toolbox) => {
    const {
      print: { info, warning },
      prompt: { ask },
    } = toolbox;
    const { execSync } = require("child_process");

    const cwd = process.cwd();
    const options = { cwd, stdio: "inherit" };

    const gitBranch = execSync(`git branch --show-current`);

    if (!gitBranch.includes("arcpatch")) {
      warning(
        `Current branch ${gitBranch} is not a Phabricator differential. running 'git pull --rebase.\n'`
      );
      execSync("git pull --rebase", options);
      return 0;
    }

    const diff = gitBranch.replace("arcpatch-");

    execSync(`arc patch --nobranch ${diff}`, options);
  },
};
