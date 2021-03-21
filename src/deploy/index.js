require('dotenv').config()
const path = require('path');
const fs = require('fs');
const moment = require('moment');
const GhostAdminApi = require('@tryghost/admin-api');

(async function main() {
  try {
    const api = new GhostAdminApi({
      url: process.env.GHOST_ADMIN_API_URL,
      key: process.env.GHOST_ADMIN_API_KEY,
      version: 'canary'
    });


    const themePath = path.join(__dirname, '../../', 'liebling.zip');

    const date = new Date();
    const dateFormat = moment(date).format("MM-DD-HH-mm-ss")

    const extension = path.extname(themePath);
    const basename = path.basename(themePath, extension);

    const getNewThemPath = () => {
      return new Promise((resolve) => {
        let reNameFilePath = path.join(__dirname, '../../', `${basename}  ${dateFormat}${extension}`)

        return fs.rename(themePath, reNameFilePath, (err) => {
          if (err) throw err;

          resolve(reNameFilePath);
        });
      });
    }

    let newThemePath = await getNewThemPath(themePath);

    // Deploy it to the configured site
    await api.themes.upload({file: newThemePath});
    console.log('Theme successfully uploaded.');

    fs.unlink(newThemePath,(err)=>{
      if(err && err.code == 'ENOENT') {
        console.info("File doesn't exist, won't remove it.");
      } else if (err) {
        console.error("Error occurred while trying to remove file");
      } else {
        console.info(`Theme file removed`);
      }
    });

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}());
