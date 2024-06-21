# Web Vitals Measurement Script

This Node.js script measures key Web Vitals metrics (Cumulative Layout Shift, Total Blocking Time, and Largest Contentful Paint) for a list of websites using Puppeteer. The results are saved to a CSV file for further analysis.

## Features

- Measures CLS, TBT, and LCP for specified websites
- Emulates an iPhone 12 device
- Applies CPU throttling to simulate a mid-tier mobile device
- Saves results to a CSV file, appending new data to existing file
- Colorful console output for better readability

## Prerequisites

- Node.js (version 12 or higher recommended)
- npm & yarn

## Installation

1. Clone this repository or download the script.
2. Navigate to the script's directory in your terminal.
3. Run `yarn install` to install the required dependencies.

## Usage

1. Modify the `SITES` array in the script to include the websites you want to measure.
2. Run the script using the command:
   `yarn benchmark`
3. The script will output progress and results to the console and save the data to `web-vitals.csv` in the same directory.

## Configuration

- `SITES`: An array of objects containing the title and URL of each website to be measured.
- `CSV_FILE`: The name of the CSV file where results will be saved (default: "web-vitals.csv").

## Output

The script generates a CSV file with the following columns:

- **Date:** Timestamp of the measurement
- **Site:** Name of the website
- **CLS:** Cumulative Layout Shift score
- **TBT:** Total Blocking Time in milliseconds
- **LCP:** Largest Contentful Paint in milliseconds

## Dependencies

- puppeteer: For browser automation and performance measurement
- csv-writer: For writing results to CSV format
- chalk: For colorful console output

## Notes

- The script uses Puppeteer in headless mode by default. To run with a visible browser, uncomment the line `const browser = await puppeteer.launch({ headless: false });` and comment out the line `const browser = await puppeteer.launch();`.
- The script waits for 10 seconds after page load to allow for content loading before measuring metrics. This duration can be adjusted if needed.
