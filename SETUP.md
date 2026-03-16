# Blueprints Partner Website - Setup Guide

## 1. Google Sheets + Email Notification (5 minutes)

### Step 1: Create the Google Sheet

1. Go to sheets.google.com
2. Create a new blank spreadsheet
3. Name it "Blueprints Partner - Inquiries"
4. In Row 1, add these headers (one per column):

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Timestamp | Name | Email | Business | Service | Challenge |

5. Copy the spreadsheet URL - you'll need it in a moment

### Step 2: Add the Script

1. In your Google Sheet, click **Extensions > Apps Script**
2. Delete everything in the editor
3. Paste the code below (the entire block)
4. Click the floppy disk icon to save
5. Name the project "Blueprints Partner Form"

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Append the row
    sheet.appendRow([
      new Date().toLocaleString('en-GB', { timeZone: 'Europe/Madrid' }),
      data.name || '',
      data.email || '',
      data.business || '',
      data.service || '',
      data.challenge || ''
    ]);

    // Send email notification
    var subject = 'New Blueprint Inquiry: ' + (data.name || 'Unknown');
    var serviceNames = {
      'clarity': 'Blueprint Clarity (€150)',
      'build': 'Blueprint Build (€1,000)',
      'launch': 'Blueprint Launch (€2,500)',
      'custom': 'Blueprint Custom',
      'not-sure': 'Not sure yet'
    };

    var body = 'New inquiry from the Blueprints Partner website!\n\n' +
      'Name: ' + (data.name || 'Not provided') + '\n' +
      'Email: ' + (data.email || 'Not provided') + '\n' +
      'Business: ' + (data.business || 'Not provided') + '\n' +
      'Service: ' + (serviceNames[data.service] || data.service || 'Not selected') + '\n' +
      'Challenge: ' + (data.challenge || 'Not provided') + '\n\n' +
      'Reply to them at: ' + (data.email || '') + '\n' +
      'They should be booking a call next at cal.com/davidbanjo';

    // Send to both David and Winifred
    GmailApp.sendEmail('davidbanjo@gmail.com', subject, body);
    // Add Winifred's email below if you want her notified too:
    // GmailApp.sendEmail('winifred@example.com', subject, body);

    return ContentService.createTextOutput(
      JSON.stringify({ result: 'success' })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ result: 'error', error: error.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
```

### Step 3: Deploy as Web App

1. Click **Deploy > New deployment**
2. Click the gear icon next to "Select type" and choose **Web app**
3. Set:
   - Description: "Blueprints Partner Form"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Deploy**
5. It will ask for permissions - click **Review Permissions**, choose your Google account, click **Advanced > Go to Blueprints Partner Form (unsafe)**, then **Allow**
6. Copy the **Web app URL** - it looks like: `https://script.google.com/macros/s/AKfycb.../exec`

### Step 4: Add the URL to your website

Open `index.html` and find this line:
```javascript
const sheetUrl = ''; // Add your Google Apps Script web app URL here
```

Replace it with your URL:
```javascript
const sheetUrl = 'https://script.google.com/macros/s/YOUR_ID_HERE/exec';
```

That's it! Form submissions will now:
- Add a row to your Google Sheet
- Send you an email with the inquiry details

---

## 2. Cal.com Setup (3 minutes)

1. Go to cal.com and sign up (free)
2. Your booking link will be: cal.com/davidbanjo (or whatever username you choose)
3. Create an event type:
   - Name: "Blueprint Intro Call"
   - Duration: 15 minutes
   - Description: "A quick call to understand where you are and what you need. No pitch, no pressure."
4. Set your availability (your timezone is CET/Madrid)
5. Once live, the website buttons will work automatically

---

## 3. Deploying the Website

When ready to go live, you have several options:

### Option A: Vercel (free, recommended)
1. Push the project to GitHub
2. Connect to Vercel
3. Deploy - get a free URL like blueprints-partner.vercel.app
4. Connect your custom domain if you have one

### Option B: Netlify (free)
1. Drag and drop the project folder to netlify.com/drop
2. Get a free URL instantly
3. Connect custom domain later

### Option C: GitHub Pages (free)
1. Push to GitHub
2. Enable Pages in repo settings
3. Live at yourusername.github.io/repo-name
