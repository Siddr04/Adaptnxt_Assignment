const axios = require("axios");
const cheerio = require("cheerio");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");

const fetchDetails = async () => {
  try {
    const response = await axios.get(
      "https://www.quill.com/hanging-file-folders/cbk/122567.html"
    );
    const html = response.data;
    const $ = cheerio.load(html);
    const products = [];

    const productElements = $(
      ".product-card.border.js-border-wrap.search-product-card.p-3.rounded-xl"
    ).slice(0, 10);

    for (const ele of productElements) {
      const product = $(ele);
      const category = "Hanging File Folders";
      const title = product
        .find(
          "a.blue-hover-link.scTrack.pfm.fg-jet.search-product-name.font-weight-lightbold"
        )
        .text()
        .trim();
      const price = product
        .find(".h6.mb-1.savings-highlight-wrap")
        .text()
        .trim()
        .replace(/\s+/g, ",");
      const itemNumber = product
        .find(".col.body-xxs.pl-2.fg-jet-tint")
        .text()
        .trim()
        .replace("Item #:", "");
      const href = product
        .find(
          "a.blue-hover-link.scTrack.pfm.fg-jet.search-product-name.font-weight-lightbold"
        )
        .attr("href");

      try {
        const newResponse = await axios.get(`https://www.quill.com${href}`);
        const newHtml = newResponse.data;
        const new$ = cheerio.load(newHtml);
        const modelNumber = new$(".mb-2.mb-md-0.ml-md-2.d-none.d-sm-flex")
          .text()
          .trim();
        const ModelNumber = modelNumber.match(/Model #:\s*(\S+)/)[1];
        let description = new$(".text-left.text-justify.mb-3").text().trim();
        description = description.replace(/\n/g, " "); 
        description = description.replace(/\s{2,}/g, " "); 
        products.push({
          title,
          price,
          itemNumber,
          ModelNumber,
          description,
          category
        });
      } catch (error) {
        console.log("Error fetching model number:", error);
      }
    }

    return products;
  } catch (err) {
    console.log(err);
  }
};


const writeProductsToCSV = async (products) => {
  const csvWriter = createCsvWriter({
    path: "products.csv",
    header: [
      { id: "title", title: "Title" },
      { id: "price", title: "Price" },
      { id: "itemNumber", title: "Item Number" },
      { id: "ModelNumber", title: "Model Number" },
      { id: "description", title: "Product Description" },
      { id: "category", title: "Product Category" }
    ]
  });

  await csvWriter.writeRecords(products);
  console.log("CSV file has been written successfully");
};

fetchDetails().then((products) => writeProductsToCSV(products));
