module.exports = (toolbox) => {
  const { spawn } = require("child_process");
  toolbox.Conduit = function (url, token) {
    this.url = url;
    this.token = token;

    this.request = async function (apiMethod, body = {}) {
      const sendCall = new Promise((res, rej) => {
        const contents = [];
        const err = [];
        const params = [
          "call-conduit",
          "--conduit-uri",
          this.url,
          "--conduit-token",
          this.token,
          "--",
          apiMethod,
        ];
        const subprocess = spawn("arc", params);

        subprocess.stdin.write(JSON.stringify(body));
        subprocess.stdin.end();

        subprocess.stdout.on("data", (data) => {
          contents.push(data);
        });
        subprocess.stderr.on("data", (data) => {
          err.push(data);
        });

        subprocess.on("close", (code) => {
          if (code !== 0 || err.length !== 0) {
            console.error(`arc process exited with code ${code}`);
            rej(err.join());
          }

          res(JSON.parse(contents.join()));
        });
      });

      const { error, errorMessage, response } = await sendCall;

      if (error) {
        const errObj = new Error(errorMessage);
        errObj.code = error;
        throw errObj;
      }

      return response;
    };

    this.getDiffs = async function (...diffs) {
      const ids = diffs.map((s) => Number(s.replace(/^d/i, "")));

      const { data } = await this.request("differential.diff.search", {
        constraints: { ids },
      });

      return data;
    };

    this.getReviews = async function (diff) {
      const id = Number(diff.replace(/^d/i, ""));

      const { data } = await this.request("differential.revision.search", {
        constraints: { ids: [id] },
      });

      return data;
    };

    this.review = async function (diff, action = "accept") {
      if (
        !["accept", "reject", "plan-changes", "request-review"].includes(action)
      ) {
        throw new Error(`'${action}' is not an allowed action.`);
      }

      const [entry] = await this.getDiffs(diff);

      return this.request("differential.revision.edit", {
        objectIdentifier: entry.id,
        transactions: [{ type: action, value: true }],
      });
    };
  };
};
