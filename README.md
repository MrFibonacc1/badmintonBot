# Badminton Court Auto-Booker

Automatically reserves badminton court times at Ottawa rec centres (Cardelrec, Richcraft Kanata, Eva James) right when bookings open at 6:00 PM. Uses Playwright to fill out the reservation form so you don't have to race other people.

## Schedule

| Day you run it | Centre | Books for | Time Slot |
|---|---|---|---|
| Thursday | Cardelrec | Saturday | 7:00 PM |
| Friday | Cardelrec | Sunday | 11:00 AM |
| Sunday | Eva James | Tuesday | 7:00 PM |
| Tuesday | Richcraft Kanata | Thursday | 7:00 PM |

## Setup

**Prerequisites:** [Node.js](https://nodejs.org/) (v18+) and Google Chrome installed.

```bash
# 1. Clone the repo
git clone <repo-url>
cd bot

# 2. Install dependencies
npm install playwright

# 3. Install Playwright browsers
npx playwright install chromium
```

## Configuration

Edit the top of `autofill.js` to set your own info:

```js
const NAME = 'Your Name';
const EMAIL = 'your@email.com';
const PHONE = '1234567890';
```

## Usage

Run the script on the appropriate day **before 6:00 PM**. It will open the browser, navigate to the booking page, and wait until exactly 6:00 PM to start clicking.

```bash
node autofill.js
```

The browser stays open after booking so you can verify everything went through. Press `Ctrl+C` to close.

## How It Works

1. Opens Chrome with a persistent profile (avoids Cloudflare bot detection)
2. Navigates to the correct rec centre based on the current day
3. Waits until exactly 6:00 PM
4. Clicks the badminton activity, selects the target day and time slot
5. Fills in your contact info and submits the reservation

## Notes

- The script books **2 spots** per reservation
- If you run it on a day not listed in the schedule, it defaults to the Eva James booking page
- The browser runs in **headed mode** (not headless) — you'll see the browser window
