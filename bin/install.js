const path = require("path");
const fs = require("fs");
const { execSync } = require("child_process");

const packageJson = require("../package.json");

const commandExists = require("command-exists");
const AdmZip = require("adm-zip");
const fetch = require("node-fetch");

const libphutilSrc = "https://github.com/phacility/libphutil/zipball/stable";
const arcanistSrc = "https://github.com/phacility/arcanist/zipball/stable";

const rootDir = path.dirname(__dirname);

async function downloadAndUnzip(name, source, dest) {
  const filename = path.resolve(rootDir, `${name}.zip`);
  const stream = fs.createWriteStream(filename);

  const response = await fetch(source);

  return new Promise((res, rej) => {
    response.body
      .pipe(stream)
      .on("finish", () => {
        stream.close();

        const zip = new AdmZip(filename);
        zip.getEntries().forEach((entry) => {
          const { entryName } = entry;

          const entrySplit = entryName.split("/");
          entrySplit.shift();
          const revisedPath = path.join(dest, ...entrySplit);

          if (entry.isDirectory) {
            fs.mkdirSync(path.resolve(revisedPath), { recursive: true });
            return;
          }

          zip.extractEntryTo(entry, path.dirname(revisedPath), false, true);
        });

        fs.unlinkSync(filename);
        res();
      })
      .on("error", (err) => {
        rej(err);
      });
  });
}

(async () => {
  try {
    await commandExists("devctl");
  } catch {
    console.error(
      `Please install \`devctl\`. This plugin is useless without it. Run  yarn global add @splitmedialabs/devctl`
    );
    process.exit(1);
  }

  try {
    await commandExists("php");
  } catch {
    console.error(
      `Please install the required command 'php' https://www.php.net/manual/en/install.php`
    );
    process.exit(2);
  }

  try {
    await commandExists("arc");
    console.warn(
      `The "arc" command already exists. Chances are, you will not be using a version installed by this package. Installing anyway...`
    );
  } catch {
    console.warn(`Installing arc...`);
  }

  try {
    yieldy;
    yhy;

    // Create dir
    fs.mkdirSync("arcanist", { recursive: true });

    // Download and install libphutil
    await downloadAndUnzip(
      "libphutil",
      libphutilSrc,
      path.resolve(rootDir, "arcanist/libphutil")
    );
    await downloadAndUnzip(
      "arcanist",
      arcanistSrc,
      path.resolve(rootDir, "arcanist/arcanist")
    );

    fs.chmodSync(path.resolve(rootDir, "arcanist/arcanist/bin/arc"), "0755");

    console.log("Installation complete");

    const { aliases } = packageJson["devctl-plugin-arcanist"];

    for (const [alias, command] of Object.entries(aliases)) {
      execSync(`arc alias -- ${alias} "${command.join(" ")}"`);
    }
  } catch (e) {
    console.error(e);
  }
})();
