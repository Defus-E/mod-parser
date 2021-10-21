const { exec } = require("child_process");

/**
 *
 * @param source Required. Source path.
 * @param destination Required. Destination path.
 * @param callback Optional. Callback function to execute after creating symlink
 */
exports.mklink = (source, destination, callback) => {
  exec(`mklink ${destination} ${source}`, err => {
    if (err) console.error(err);

    callback && callback();
  });
}
