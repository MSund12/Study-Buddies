# Study Buddies 

Welcome to **Study Buddies**, a fast and simple web project setup using **Vite**. This guide will walk you through the steps to clone, install dependencies, and get the project running on your local machine.

---
## 📋 Prerequisites

Before running the project, you need to have **Node.js** installed. If you don’t have it yet, follow the steps below to install it:

- Download and install **Node.js** from the official website: [nodejs.org](https://nodejs.org/en/download).
- **Recommended version:** LTS (Long Term Support).
- ![image](https://github.com/user-attachments/assets/d8d65014-ba44-4bde-a8fa-fb5782ddccf8)

- this version is the correct one, same thing for mac or linux, if using installer simply let it run UNTIL it is clear it has finished, dont guess


After installing Node.js, make sure you have **npm** (Node Package Manager) available by running:

```bash
node -v
npm -v
```

Note: If you have an issue when running npm -v view the bottom of this doc 

🚀 Getting Started
1. Clone the Repository
First, clone the repository to your local machine using Git. Open your terminal and run:
```bash
git clone https://github.com/username/repository-name.git
cd study_buddies (MUST be in study_buddies not Study-Buddies
```
This will download the project files to your local directory and navigate into it.


2. Install Dependencies
Now that you've cloned the repo, install the project dependencies (which are listed in the package.json file) by running:
Frontend (React)
```bash
npm install
```

3. Create .env file
In the server folder create a new file titled .env
In that file paste what was emailed.
Or if you have the tile, rename it from env to .env put it inside the server folder, inside the project. Tha tis study_buddies/server
**Remember: Do not share this file publicly, as it contains sensitive information.**

5. Start Server
From the **server** folder, run:

```bash
node server.js
```
If you're not already in the server folder, navigate to it with:

```bash
cd <File-Path-to-Server-Folder> aka cd server (if in study_buddies)
```

5. Start Frontend (New Terminal):
From the **study_buddies** folder, run:

```bash
npm run dev
```

If you're not already in the study_buddies folder, navigate to it with:

```bash
cd <File-Path-to-study_buddies-Folder>
```

This will launch the development server, and your project will be accessible at the link provided in the terminal, (control + click on the link)

## Please start at log.txt when marking project documents, it will make it easier for you!! 
Can be found in Project Documents


## ⚠️ Potential Issues

If when runing npm -v it says running scripts is disabled on this system, simply run the following command:

```bash
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned
```
