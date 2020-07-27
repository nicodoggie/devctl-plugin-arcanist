const path = require("path");
const commandExists = require("command-exists");
const AdmZip = require("adm-zip");

const fetch = require("node-fetch");

const https = require("https");
const fs = require("fs");

const libphutilSrc = "https://github.com/phacility/libphutil/zipball/stable";
const arcanistSrc = "https://github.com/phacility/arcanist/zipball/stable";

async function downloadAndUnzip(name, source, dest) {
  const filename = `${name}.zip`;
  const stream = fs.createWriteStream(filename);

  fetch(source).then((response) => {
    response.body
      .pipe(stream)
      .on("finish", () => {
        stream.close();

        const zip = new AdmZip(filename);
        zip.getEntries().forEach((entry) => {
          const { entryName } = entry;
          const entrySplit = entryName.split(path.sep);
          entrySplit.shift();
          const revisedPath = path.resolve(dest, path.join(...entrySplit));
          zip.extractEntryTo(entry, path.dirname(revisedPath), false, true);
        });
      })
      .on("error", (err) => {
        console.error(err);
      });
  });
}

(async () => {
  if (!commandExists("php")) {
    console.error(
      `Please install the required command 'php' https://www.php.net/manual/en/install.php`
    );
    process.exit(1);
  }

  // Create dir
  fs.mkdirSync("arcanist", { recursive: true });

  // Download and install libphutil
  await downloadAndUnzip("libphutil", libphutilSrc, "arcanist/libphutil");
  await downloadAndUnzip("arcanist", arcanistSrc, "arcanist/arcanist");
})();
