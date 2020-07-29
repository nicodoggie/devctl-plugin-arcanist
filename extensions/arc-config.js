module.exports = async (toolbox) => {
  const { cosmiconfig } = require("cosmiconfig");
  const get = require("lodash/get");
  const { config: loadConfig } = toolbox;

  toolbox.getArcconfig = async () => {
    const search = await cosmiconfig("devctl", {
      searchPlaces: [".arcconfig"],
    }).search();

    if (!search) {
      return {};
    }

    const phabUri = get(search, 'config["phabricator.uri"]');
    const callsign = get(search, 'config["repository.callsign"]');

    return {
      phabUri,
      callsign,
      repoPath: search.filepath,
    };
  };

  toolbox.getArcrc = async () => {
    const search = await cosmiconfig("devctl", {
      searchPlaces: [".arcrc"],
    }).search("~");

    if (!search) {
      console.log("test");
      return {};
    }

    const { config } = search;
    const { hosts } = config;
    const defaultHost = get(config, "default", null);

    return {
      ...search.config,
      token: defaultHost ? hosts[defaultHost].token : null,
    };
  };

  toolbox.config = {
    ...toolbox.config,
    arcanist: {
      ...(await toolbox.getArcconfig()),
      ...(await toolbox.getArcrc()),
    },
  };
};
