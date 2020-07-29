module.exports = {
  name: "arc:diffland",
  run: async (toolbox) => {
    const { execSync } = require("child_process");
    const cwd = process.cwd();

    function getDifferentialFromCommit(commitLog) {
      const regex = /Differential Revision: http(.)*(D[\d]+)/gm;
      let m;

      while ((m = regex.exec(commitLog)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (m.index === regex.lastIndex) {
          regex.lastIndex++;
        }

        return m[2];
      }
    }

    const options = { cwd, stdio: "inherit" };

    execSync(`arc diff`, options);

    const gitlog = execSync("git log -1", {
      cwd,
      stdio: "pipe",
      encoding: "utf8",
    });

    const diff = getDifferentialFromCommit(gitlog);
    execSync(`devctl arc:accept ${diff}`, options);
    execSync(`arc land`, options);
  },
};
