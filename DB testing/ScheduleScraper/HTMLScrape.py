from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json
import time
import os
import re 

# List of target URLs (add as many as needed)
# can be fetched from https://w2prod.sis.yorku.ca/Apps/WebObjects/cdm.woa/10/wo/0sKP9wOzZsq2hWyWgaTojg/4.3.4.37.0
# link that ends in LE is lassonde engineering courses link that ends in SC is faculty of science courses
target_urls = [
    "https://apps1.sis.yorku.ca/WebObjects/cdm.woa/Contents/WebServerResources/FW2024LE.html",
    "https://apps1.sis.yorku.ca/WebObjects/cdm.woa/Contents/WebServerResources/FW2024SC.html"
]

# Get the path of the current script directory (used for JSON dumping location)
script_dir = os.path.dirname(os.path.realpath(__file__))

driver = webdriver.Chrome()  # Ensure ChromeDriver is installed (might remove from the driver from being included in git as exe files seem sus but will include link where to download from google)

def parse_html(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    courses_data = []
    rows = soup.find_all('tr')
    
    for i, row in enumerate(rows):
        cols = row.find_all('td')
        if not cols:
            continue  # Skip rows without <td>
        
        # Identify header row by checking for a <strong> in the first cell (bold words mean name of course will be displayed in that row)
        if cols[0].find('strong'):
            if len(cols) >= 4:
                # Create a course header with an empty Course ID (will be updated later when encountering lecture row)
                course_data = {
                    "Fac": cols[0].get_text(strip=True),
                    "Dept": cols[1].get_text(strip=True),
                    "Term": cols[2].get_text(strip=True),
                    "Course Name": cols[3].get_text(strip=True),
                    "Course ID": "",  # Will store only the 4-digit base number here as that is only thing shared across sections
                    "Hours": []
                }
                courses_data.append(course_data)
            else:
                print(f"Header row {i} does not have enough columns; found {len(cols)}")
            continue  # Move to the next row

        # Determine row type by inspecting the colspan attribute of the first cell
        # colspan =3 means lecture
        # colspan = 5 means tutorial or lab
        first_td = cols[0]
        colspan = first_td.get("colspan")
        
        if colspan == "3":
            # This is a lecture row as lecture rows have first column span 3 columns
            # they are formatted as follows using [] to explain which column shows what
            # [0] blank [1] course id (eg 2021) [2] LOI (I believe language of instruction so all should be EN(english))
            # [3] Type (lect) [4] meet (distinguishes between the different lecture sections) [5] Cat NO (for lectures empty)
            # [6] Day, Time, Duration, Campus, Room [7] Instructor

            if not courses_data:
                continue  # Skip if no course header was recorded
            
            # extract the full course ID from the second cell
            raw_course_id = cols[1].get_text(strip=True)
            clean_course_id = " ".join(raw_course_id.replace("\u00a0", " ").split())
            
            # set course id of course to the 4 digit number (if not set yet)
            if not courses_data[-1]["Course ID"]:
                match = re.search(r'\d{4}', clean_course_id)
                if match:
                    base_course_id = match.group(0)
                else:
                    base_course_id = clean_course_id
                courses_data[-1]["Course ID"] = base_course_id
                
            if len(cols) < 9:
                print(f"Lecture row {i} has insufficient columns: {len(cols)}")
                continue

            try:
                meet_val = int(cols[4].get_text(strip=True))
            except ValueError:
                meet_val = cols[4].get_text(strip=True)

            meeting_table = cols[6]
            meeting_rows = meeting_table.find_all('tr')
            print(f"Row {i}: Found {len(meeting_rows)} lecture meeting rows")
            for meeting in meeting_rows:
                meeting_details = meeting.find_all('td')
                if len(meeting_details) >= 5:
                    try:
                        duration = int(meeting_details[2].get_text(strip=True))
                    except ValueError:
                        duration = meeting_details[2].get_text(strip=True)
                    hour_data = {
                        "Type": cols[3].get_text(strip=True),
                        "Meet": meet_val,
                        "Cat.No": cols[5].get_text(strip=True),
                        "Day": meeting_details[0].get_text(strip=True),
                        "Time": meeting_details[1].get_text(strip=True),
                        "Dur": duration,
                        "Campus": meeting_details[3].get_text(strip=True),
                        "Room": meeting_details[4].get_text(strip=True),
                        "Full Course ID": clean_course_id
                    }
                    courses_data[-1]["Hours"].append(hour_data)
        
        elif colspan == "5":
            # In the HTML table if the first column spans across 5 then it is a Lab or a tutorial row
            # they are formatted as follows using [] to explain which column shows what
            # [0] blank [1] type (lab or tutorial) [2] meet number (This distinguishes the separate tutorials)
            # [3] Cat code (sometimes blank) [4] Day, Time, Duration, Campus, Room [5] Instructors (not being recoreded)
            if not courses_data:
                continue
            if len(cols) < 7:
                print(f"Tutorial row {i} has insufficient columns: {len(cols)}")
                continue

            try:
                meet_val = int(cols[2].get_text(strip=True))
            except ValueError:
                meet_val = cols[2].get_text(strip=True)
                    
            meeting_table = cols[4]
            meeting_rows = meeting_table.find_all('tr')
            print(f"Row {i}: Found {len(meeting_rows)} tutorial meeting rows")
            for meeting in meeting_rows:
                meeting_details = meeting.find_all('td')
                if len(meeting_details) >= 5:
                    try:
                        duration = int(meeting_details[2].get_text(strip=True))
                    except ValueError:
                        duration = meeting_details[2].get_text(strip=True)
                    hour_data = {
                        "Type": cols[1].get_text(strip=True),
                        "Meet": meet_val,
                        "Cat.No": cols[3].get_text(strip=True),
                        "Day": meeting_details[0].get_text(strip=True),
                        "Time": meeting_details[1].get_text(strip=True),
                        "Dur": duration,
                        "Campus": meeting_details[3].get_text(strip=True),
                        "Room": meeting_details[4].get_text(strip=True)
                    }
                    courses_data[-1]["Hours"].append(hour_data)
        else:
            print(f"Skipping row {i} due to unexpected colspan: {colspan}")
    return courses_data

try:
    all_courses_data = []
    
    # Load up first URL to login through passport york
    driver.get(target_urls[0])
    time.sleep(30)  # 30 seconds given for you to login to passport york and authenticate using DUO adjust if needed
    
    # Loop over every single URL in the list
    for url in target_urls:
        print(f"Scraping: {url}")
        driver.get(url)
        
        # ensure page is loaded
        WebDriverWait(driver, 30).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )
        html_content = driver.page_source
        courses_data = parse_html(html_content)
        all_courses_data.extend(courses_data)
    
    # dump the data to a JSON file in the same directory as the Python file
    json_file_path = os.path.join(script_dir, 'courses_data.json')
    with open(json_file_path, 'w') as json_file:
        json.dump(all_courses_data, json_file, indent=4)
    
    print(f"Data extraction complete, saved to '{json_file_path}'")
    
finally:
    driver.quit()