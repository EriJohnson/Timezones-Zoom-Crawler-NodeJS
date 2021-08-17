const puppeteer = require('puppeteer');
const fs = require('fs');
const axios = require('axios');

(async () => {
  const TIMEZONES_ZOOM_URL =
    'https://marketplace.zoom.us/docs/api-reference/other-references/abbreviation-lists#timezones';

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(TIMEZONES_ZOOM_URL);

  const timezones = await page.evaluate(() => {
    const TIMEZONES_TABLE = 3;

    const timezonesTable = document.querySelectorAll('table')[TIMEZONES_TABLE];

    const tableRowsList = timezonesTable.children[1].querySelectorAll('tr');
    const tableRowsArray = [...tableRowsList];

    const timezones = tableRowsArray.map(tr => ({
      code: tr.children[0].innerHTML,
      name: tr.children[1].innerHTML,
    }));

    return timezones;
  });

  let formattedTimezonesList = [];
  for (const timezone of timezones) {
    try {
      const response = await axios.get(
        `http://worldtimeapi.org/api/timezone/${timezone.code}`
      );

      formattedTimezonesList.push({
        code: timezone.code,
        name: `(GMT${response.data.utc_offset}) ${timezone.name}`,
      });
    } catch (error) {
      console.log(error);

      formattedTimezonesList.push({
        code: timezone.code,
        name: `(GMT-00:00) ${timezone.name}`,
      });
    }

    console.log(`parsedTimezones`, timezonesList);
  }

  fs.writeFile(
    'timezones.json',
    JSON.stringify(formattedTimezonesList, null, 2),
    error => {
      if (error) throw new Error('Something went wrong!');

      console.log('The process completed successfully.');
    }
  );

  await browser.close();
})();
