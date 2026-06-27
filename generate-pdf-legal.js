import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });
  
  const page = await browser.newPage();
  
  // Set viewport untuk Legal paper width
  await page.setViewport({
    width: 816,  // 8.5 inches at 96 DPI
    height: 1344, // 14 inches at 96 DPI
    deviceScaleFactor: 2
  });
  
  console.log('Loading page...');
  await page.goto('http://localhost:5173/for-safubot', {
    waitUntil: 'networkidle0',
    timeout: 60000
  });
  
  // Wait untuk images load
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('Generating PDF (Legal size)...');
  
  const pdfPath = path.join('C:', 'Users', 'syahu', 'standout-docs', 'SafuBot_Proposal_Legal.pdf');
  
  await page.pdf({
    path: pdfPath,
    format: 'Legal',  // 8.5 x 14 inches
    printBackground: true,
    margin: {
      top: '15mm',
      right: '15mm',
      bottom: '15mm',
      left: '15mm'
    },
    preferCSSPageSize: false
  });
  
  console.log('✅ PDF generated:', pdfPath);
  
  await browser.close();
})();
