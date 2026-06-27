import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Set viewport untuk consistency
  await page.setViewport({
    width: 1200,
    height: 1600,
    deviceScaleFactor: 2
  });
  
  // Navigate ke localhost (dev server harus running)
  console.log('Loading page...');
  await page.goto('http://localhost:5173/for-safubot', {
    waitUntil: 'networkidle0',
    timeout: 30000
  });
  
  // Wait untuk images load
  await page.waitForTimeout(2000);
  
  console.log('Generating PDF...');
  
  const pdfPath = path.join('C:', 'Users', 'syahu', 'standout-docs', 'SafuBot_Proposal_Web.pdf');
  
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: {
      top: '0mm',
      right: '0mm',
      bottom: '0mm',
      left: '0mm'
    },
    preferCSSPageSize: false
  });
  
  console.log('PDF generated:', pdfPath);
  
  await browser.close();
})();
