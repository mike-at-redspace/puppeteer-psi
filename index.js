import puppeteer, { KnownDevices } from "puppeteer";
import { createObjectCsvWriter } from "csv-writer";
import fs from "fs";
import chalk from "chalk";

const SITES = [
  { title: "CMT", url: "https://www.cmt.com" },
  { title: "TV Land", url: "https://www.tvland.com" },
  { title: "Logo TV", url: "https://www.logotv.com" },
];

const CSV_FILE = "web-vitals.csv";

async function measureSite(browser, site) {
  const page = await browser.newPage();

  await page.emulate(KnownDevices["iPhone 12"]);

  // Enable CPU throttling to simulate a mid-tier mobile device
  const client = await page.target().createCDPSession();
  await client.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  console.log(chalk.blue(`Navigating to ${chalk.white.bold(site.url)}`));
  await page.goto(site.url, { waitUntil: "networkidle0" });
  console.log(chalk.green(`Loaded ${chalk.white.bold(site.url)}`));

  // Wait for 10 seconds to allow for content loading
  await new Promise((resolve) => setTimeout(resolve, 10000));

  const metrics = await page.evaluate(() => {
    return new Promise((resolve) => {
      let cls = 0;
      let tbt = 0;
      let lcp = 0;

      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });

      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry) => {
          if (entry.duration > 50) {
            tbt += entry.duration - 50;
          }
        });
      }).observe({ type: "longtask", buffered: true });

      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        lcp = entries[entries.length - 1].startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });

      // Resolve after a short delay to ensure we've captured the metrics
      setTimeout(() => {
        resolve({ cls, tbt, lcp });
      }, 1000);
    });
  });

  console.log(
    chalk.yellow(`Metrics for ${chalk.white.bold(site.title)}:`),
    metrics
  );

  await page.close();

  return {
    date: new Date().toISOString(),
    site: site.title,
    cls: metrics.cls.toFixed(4),
    tbt: metrics.tbt.toFixed(2),
    lcp: metrics.lcp.toFixed(2),
  };
}

async function runTests() {
  const fileExists = fs.existsSync(CSV_FILE);

  const csvWriter = createObjectCsvWriter({
    path: CSV_FILE,
    header: [
      { id: "date", title: "Date" },
      { id: "site", title: "Site" },
      { id: "cls", title: "CLS" },
      { id: "tbt", title: "TBT (ms)" },
      { id: "lcp", title: "LCP (ms)" },
    ],
    append: fileExists,
  });

  if (!fileExists) {
    await csvWriter.writeRecords([]); // Write header if file doesn't exist
  }

  //const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.launch();

  // Close the initial blank tab
  const pages = await browser.pages();
  await pages[0].close();

  // Run measurements for all sites in parallel
  const results = await Promise.all(
    SITES.map((site) => measureSite(browser, site))
  );

  // Write all results to CSV
  await csvWriter.writeRecords(results);

  await browser.close();
}

runTests().catch((error) =>
  console.error(chalk.red("Error in runTests:"), error)
);
