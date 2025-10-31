// autofill.js
import { chromium } from 'playwright';

(async () => {
  // === CONFIGURATION ===
  const NAME = 'Huzaifa Rehan';
  const EMAIL = 'huzaifarehan004@gmail.com';
  const PHONE = '6137092004';

  // === GET CURRENT DATE ===
  const now = new Date();
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
  const fullDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  console.log(`Running script on: ${dayOfWeek}, ${fullDate}`);

  // === SET TARGET URL BASED ON DAY ===
  let TARGET_URL;
  if (dayOfWeek === 'Thursday' || dayOfWeek === 'Friday') {
    TARGET_URL = 'https://reservation.frontdesksuite.ca/rcfs/cardelrec/Home/Index?Culture=en&PageId=a10d1358-60a7-46b6-b5e9-5b990594b108&ShouldStartReserveTimeFlow=False&ButtonId=00000000-0000-0000-0000-000000000000';
  } else {
    TARGET_URL = 'https://reservation.frontdesksuite.ca/rcfs/evajamescc/Home/Index?Culture=en&PageId=96907058-93c6-46fd-bead-33729bea33c6&ShouldStartReserveTimeFlow=False&ButtonId=00000000-0000-0000-0000-000000000000';
  }
  console.log(`Using URL for ${dayOfWeek}: ${TARGET_URL}`);

  // === SETUP BROWSER ===
  const browser = await chromium.launch({
    headless: false, // change to true for background mode
    channel: 'chrome', // use Google Chrome instead of Chromium
    args: ['--disable-dev-shm-usage', '--no-sandbox'],
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // optional: block unnecessary stuff to speed up
  await page.route('**/*', route => {
    const type = route.request().resourceType();
    if (['image', 'font', 'media'].includes(type)) return route.abort();
    route.continue();
  });

  // === NAVIGATE TO PAGE ===
  console.log('Opening page...');
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });

  // === WAIT UNTIL 6:00 PM ===
  const waitUntil6PM = () => {
    return new Promise((resolve) => {
      const checkTime = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();

        console.log(`Current time: ${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);

        if (hours === 18 && minutes === 0 && seconds === 0) {
          // It's exactly 6:00:00 PM
          console.log('✅ It\'s 6:00 PM! Proceeding with booking...');
          resolve();
        } else if (hours > 18 || (hours === 18 && minutes > 0)) {
          // It's already past 6:00 PM
          console.log('⚠️  It\'s already past 6:00 PM. Proceeding immediately...');
          resolve();
        } else {
          // Calculate time until 6:00 PM
          const targetTime = new Date();
          targetTime.setHours(18, 0, 0, 0);
          const timeUntil = targetTime - now;
          const minutesUntil = Math.floor(timeUntil / 60000);
          const secondsUntil = Math.floor((timeUntil % 60000) / 1000);

          console.log(`⏰ Waiting until 6:00 PM... (${minutesUntil}m ${secondsUntil}s remaining)`);

          // Check again in 100ms for precision
          setTimeout(checkTime, 100);
        }
      };
      checkTime();
    });
  };

  await waitUntil6PM();

  // === CLICK BADMINTON BUTTON ===
  console.log('Clicking Badminton button...');
  if (dayOfWeek === 'Thursday' || dayOfWeek === 'Friday') {
    await page.click('text="Badminton - 16+"');
  } else {
    await page.click('text="Badminton - adult (18 years +)"');
  }
  await page.waitForLoadState('domcontentloaded');

  // === SET RESERVATION COUNT ===
  console.log('Setting reservation count to 2...');
  await page.fill('#reservationCount', '2');

  // === CLICK CONFIRM BUTTON ===
  console.log('Clicking Confirm button...');
  await page.click('#submit-btn');
  await page.waitForLoadState('domcontentloaded');

  // === DAY-SPECIFIC BOOKING FLOW ===
  if (dayOfWeek === 'Thursday') {
    console.log('Today is Thursday - clicking Saturday...');
    // Wait for the date section to be visible and click it
    await page.waitForSelector('.date.one-queue', { timeout: 5000 });
    await page.evaluate(() => {
      const saturdayElement = Array.from(document.querySelectorAll('.date.one-queue')).find(el =>
        el.textContent.includes('Saturday')
      );
      if (saturdayElement) {
        const link = saturdayElement.querySelector('a.title');
        if (link) link.click();
      }
    });
    console.log('✅ Saturday clicked.');

    // Click the 7:00 p.m. time slot
    console.log('Clicking 7:00 p.m. time slot...');
    await page.evaluate(() => {
      const timeSlot = Array.from(document.querySelectorAll('a.time-container')).find(el =>
        el.getAttribute('aria-label')?.includes('7:00 p.m. Saturday')
      );
      if (timeSlot) timeSlot.click();
    });
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ 7:00 p.m. time slot clicked.');

    // Fill in the contact information
    console.log('Filling contact information...');
    await page.fill('#telephone', PHONE);
    await page.fill('#email', EMAIL);
    await page.fill('#field2021', NAME);
    await page.waitForTimeout(2000);
    console.log('✅ Contact information filled.');

    // Click the final Confirm button
    console.log('Clicking final Confirm button...');
    await page.click('#submit-btn');

    // Wait and check for errors
    await page.waitForTimeout(2000);
    const hasError = await page.locator('.text-danger:visible').count();
    if (hasError > 0) {
      console.log('⚠️  Validation errors detected. Please check the form manually.');
    } else {
      console.log('✅ Final confirmation submitted.');
    }
  } else if (dayOfWeek === 'Sunday') {
    console.log('Today is Sunday - clicking Tuesday...');
    // Wait for the date section to be visible and click it
    await page.waitForSelector('.date.one-queue', { timeout: 5000 });
    await page.evaluate(() => {
      const tuesdayElement = Array.from(document.querySelectorAll('.date.one-queue')).find(el =>
        el.textContent.includes('Tuesday October')
      );
      if (tuesdayElement) {
        const link = tuesdayElement.querySelector('a.title');
        if (link) link.click();
      }
    });
    console.log('✅ Tuesday clicked.');

    // Click the 7:00 p.m. time slot
    console.log('Clicking 7:00 p.m. time slot...');
    await page.evaluate(() => {
      const timeSlot = Array.from(document.querySelectorAll('a.time-container')).find(el =>
        el.getAttribute('aria-label')?.includes('7:00 p.m. Tuesday')
      );
      if (timeSlot) timeSlot.click();
    });
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ 7:00 p.m. time slot clicked.');

    // Fill in the contact information
    console.log('Filling contact information...');
    await page.fill('#telephone', PHONE);
    await page.fill('#email', EMAIL);
    await page.fill('#field2021', NAME);
    await page.waitForTimeout(1000);
    console.log('✅ Contact information filled.');

    // Click the final Confirm button
    console.log('Clicking final Confirm button...');
    await page.click('#submit-btn');

    // Wait and check for errors
    await page.waitForTimeout(2000);
    const hasError = await page.locator('.text-danger:visible').count();
    if (hasError > 0) {
      console.log('⚠️  Validation errors detected. Please check the form manually.');
    } else {
      console.log('✅ Final confirmation submitted.');
    }
  } else if (dayOfWeek === 'Friday') {
    console.log('Today is Friday - clicking Sunday...');
    // Wait for the date section to be visible and click it
    await page.waitForSelector('.date.one-queue', { timeout: 5000 });
    await page.evaluate(() => {
      const sundayElement = Array.from(document.querySelectorAll('.date.one-queue')).find(el =>
        el.textContent.includes('Sunday')
      );
      if (sundayElement) {
        const link = sundayElement.querySelector('a.title');
        if (link) link.click();
      }
    });
    console.log('✅ Sunday clicked.');

    // Click the 11:00 a.m. time slot
    console.log('Clicking 11:00 a.m. time slot...');
    await page.evaluate(() => {
      const timeSlot = Array.from(document.querySelectorAll('a.time-container')).find(el =>
        el.getAttribute('aria-label')?.includes('11:00 a.m. Sunday')
      );
      if (timeSlot) timeSlot.click();
    });
    await page.waitForLoadState('domcontentloaded');
    console.log('✅ 11:00 a.m. time slot clicked.');

    // Fill in the contact information
    console.log('Filling contact information...');
    await page.fill('#telephone', PHONE);
    await page.fill('#email', EMAIL);
    await page.waitForTimeout(1000);
    await page.fill('#field2021', NAME);
    await page.waitForTimeout(2000);
    console.log('✅ Contact information filled.');

    // Click the final Confirm button
    console.log('Clicking final Confirm button...');
    await page.click('#submit-btn');

    // Wait and check for errors
    await page.waitForTimeout(2000);
    const hasError = await page.locator('.text-danger:visible').count();
    if (hasError > 0) {
      console.log('⚠️  Validation errors detected. Please check the form manually.');
    } else {
      console.log('✅ Final confirmation submitted.');
    }
  }

  // === CLICK THROUGH BUTTONS ===
  // You can chain multiple clicks as needed
  // Replace with your own selectors/texts
  console.log('Clicking buttons...');
  await page.click('text="Start"').catch(() => {});   // example
  await page.click('text="Continue"').catch(() => {}); // example

  // === FILL FORM FIELDS ===
  console.log('Filling form...');
  await page.fill('#name', NAME);          // or 'input[name="name"]'
  await page.fill('#email', EMAIL);
  await page.fill('#phone', PHONE);

  // === CLICK SUBMIT ===
  console.log('Submitting form...');
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }).catch(() => {}),
    page.click('button[type="submit"], text="Submit"'),
  ]);

  console.log('✅ Form submitted successfully.');

  // === CLOSE ===
  await browser.close();
})();