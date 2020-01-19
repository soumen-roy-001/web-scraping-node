const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const url = "https://www.bnk48.com/index.php?page=members";
const base_url = "https://www.bnk48.com/";

axios
  .get(url)
  .then(res => {
    downloadPics(res.data);
  })
  .catch(err => {
    console.log(err);
  });

const downloadPics = data => {
  let member_data = [];
  const $ = cheerio.load(data);
  $("div.boxMembersClass .divMemMembers .boxMemx").each((i, elem) => {
    const member_name = $(elem)
      .find(".nameMem")
      .text()
      .trim();
    const member_pic_url =
      base_url +
      $(elem)
        .find(".ImgMem")
        .attr("style")
        .slice(22, -2);
    const image_path = path.join(__dirname, "/images", member_name + ".png");

    if (fs.existsSync(image_path)) {
      fs.unlink(image_path, err => {
        if (err) throw err;
      });
    }

    (async () => {
      await download_image(member_pic_url, image_path)
        .then(() => {
          console.log("Downloaded successfully:", image_path);
        })
        .catch(err => {
          console.log("Download failed:", image_path);
        });
    })();
  });
};

const download_image = (url, image_path) =>
  axios({
    url,
    responseType: "stream"
  }).then(
    response =>
      new Promise((resolve, reject) => {
        response.data
          .pipe(fs.createWriteStream(image_path))
          .on("finish", () => resolve())
          .on("error", e => reject(e));
      })
  );
