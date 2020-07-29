module.exports = {
  name: "arc:review",
  run: async (toolbox) => {
    const get = require("lodash/get");
    const {
      print: { info, error },
      prompt: { ask },
      parameters: { first, second },
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

    const latestReview = (await conduit.getReviews(diff)).shift();
    const status = get(latestReview, "fields.status");
    const { "color.ansi": color, name, value } = status;

    const review = await (async () => {
      if (second) {
        return second;
      }

      const { reviewSelect } = await ask({
        type: "select",
        name: "reviewSelect",
        message: `${diff} current review status, "${name}", update:`,
        choices: [
          { message: "Accept", value: "accept" },
          { message: "Reject", value: "reject" },
          { message: "Plan Changes", value: "plan-changes" },
          { message: "Request Review", value: "request-review" },
        ],
      });

      return reviewSelect;
    })();

    try {
      await conduit.review(diff, review);
      info(`Reviewed ${diff}!`);
    } catch (e) {
      error(`Failed to review ${diff}.`);
      error(e);
    }
  },
};
