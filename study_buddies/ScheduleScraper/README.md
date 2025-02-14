## Requirements

To run this script, you need:

**Python 3.x** (Ensure it's installed)

**Google Chrome** (latest version)

**Chrome WebDriver** (same version as Chrome)

Python dependencies:

selenium

beautifulsoup4

Installation

1. Install Python (if not already installed)

Download and install Python 3.x from [python.org](https://www.python.org/downloads/).

2. Install Required Python Packages

Open a terminal or command prompt and run:
```bash
pip install selenium beautifulsoup4
```
3. Install Chrome and Chrome WebDriver

Ensure Chrome is installed and on newest update

Download Chrome WebDriver

Go to the ChromeDriver [download page](https://googlechromelabs.github.io/chrome-for-testing/)

Download the WebDriver version that matches your Chrome version.

Extract the file and place it in the same directory as the Python script (or add it to your system's PATH).

Usage

Step 1: Run the Script

Navigate to the folder containing HTMLScrape.py and run:
```bash
python HTMLScrape.py
```
Step 2: Log in to Passport York

After running the script, a Chrome window will open.

Manually log in with your Passport York credentials.

You have 30 seconds to complete authentication before scraping starts.

Step 3: Wait for Scraping to Complete

The script will visit each URL, extract course data, and save it.

Once completed, the data is stored in courses_data.json in the same directory.
