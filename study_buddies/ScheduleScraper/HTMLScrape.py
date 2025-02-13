from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from bs4 import BeautifulSoup
import json
import time
import os

# URL of the target page to scrape
target_url = "https://apps1.sis.yorku.ca/WebObjects/cdm.woa/Contents/WebServerResources/FW2024LE.html"

# Get the path of the current script directory
script_dir = os.path.dirname(os.path.realpath(__file__))

driver = webdriver.Chrome()  # Ensure ChromeDriver is installed

try:
    # Open the login page and hold for 30 seconds to allow user to login to their PassPort York account
    driver.get(target_url)
    time.sleep(30)

    # Reload the target website after login in case page was switched
    driver.get(target_url)

    # Wait for the page to load
    WebDriverWait(driver, 30).until(  
        EC.presence_of_element_located((By.TAG_NAME, "body"))
    )

    # Get the HTML after logging in
    html_content = driver.page_source

    # Function to parse throught the HTML website
    def parse_html(html_content):
        soup = BeautifulSoup(html_content, 'html.parser')
        courses_data = []
        rows = soup.find_all('tr')
        
        i = 0
        while i < len(rows):
            row = rows[i]
            cols = row.find_all('td')

            # For debugging
            print(f"Row {i}: {len(cols)} columns")

            if len(cols) == 4:
                # Row with 4 columns: Fac, Dept, Term, Course Name
                course_data = {
                    "Fac": cols[0].text.strip(),
                    "Dept": cols[1].text.strip(),
                    "Term": cols[2].text.strip(),
                    "Course Name": cols[3].text.strip(),
                    "Hours": []
                }
                courses_data.append(course_data)
                i += 1

            elif len(cols) == 9:
                # Row with 9 columns: blank, Course ID, LOI, Type, Meet, Cat.No., DTDCR(day time duration campus room), Instructors, Notes
                if courses_data:  
                    meeting_data = cols[8].find_all('tr')
                
                    # For debugging
                    print(f"Found {len(meeting_data)} meeting rows")
                
                    for meeting in meeting_data:
                        meeting_details = meeting.find_all('td')
                    
                        if len(meeting_details) > 0:
                            # Extract details for each meeting session
                            hour_data = {
                                "Type": cols[5].text.strip(),
                                "Meet": int(cols[6].text.strip()),
                                "Cat.No": cols[7].text.strip(),
                                "Day": meeting_details[0].text.strip(),
                                "Time": meeting_details[1].text.strip(),
                                "Dur": int(meeting_details[2].text.strip()),
                                "Campus": meeting_details[3].text.strip(),
                                "Room": meeting_details[4].text.strip()
                            }
                            courses_data[-1]["Hours"].append(hour_data)
                i += 1

            elif len(cols) == 7:
                # Row with 7 columns: blank, Type, Meet, Cat.No., DTDCR(day time duration campus room), Instructors, Notes
                if courses_data:  
                    meeting_data = cols[4].find_all('tr')

                    # For debugging
                    print(f"Found {len(meeting_data)} meeting rows")

                    for meeting in meeting_data:
                        meeting_details = meeting.find_all('td')
                    
                        if len(meeting_details) > 0:
                            # Extract details for each meeting session
                            hour_data = {
                                "Type": cols[1].text.strip(),
                                "Meet": int(cols[2].text.strip()),
                                "Cat.No": cols[3].text.strip(),
                                "Day": meeting_details[0].text.strip(),
                                "Time": meeting_details[1].text.strip(),
                                "Dur": int(meeting_details[2].text.strip()),
                                "Campus": meeting_details[3].text.strip(),
                                "Room": meeting_details[4].text.strip()
                            }
                            courses_data[-1]["Hours"].append(hour_data)
                i += 1

            else:
                # Unknown row just skip
                print(f"Skipping row {i} due to unexpected format")
                i += 1

        return courses_data

    # Parse the HTML content
    courses_data = parse_html(html_content)

    # ensure Json file is dumped in same folder
    json_file_path = os.path.join(script_dir, 'courses_data.json')

    # Save the extracted data to a JSON file in the same directory as the Python script
    with open(json_file_path, 'w') as json_file:
        json.dump(courses_data, json_file, indent=4)

    print(f"Data extraction complete, saved to '{json_file_path}'")

finally:
    driver.quit()
