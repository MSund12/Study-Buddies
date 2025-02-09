# Study Buddies 

Welcome to **Study Buddies**, a fast and simple web project setup using **Vite**. This guide will walk you through the steps to clone, install dependencies, and get the project running on your local machine.

---

## 📋 Prerequisites

Before running the project, you need to have **Node.js**, **MongoDB** (local instance or Atlas) installed. If you don’t have it yet, follow the steps below to install it:

- Download and install **Node.js** from the official website: [nodejs.org](https://nodejs.org/en/download).
- **Recommended version:** LTS (Long Term Support).
- Download and install **MongoDB** from official website: [Atlas account](https://www.mongodb.com/atlas/database).

After installing Node.js and MongoDB, make sure you have **npm** (Node Package Manager) available by running:

```bash
node -v
npm -v
mongosh --version
```

🚀 Getting Started
1. Clone the Repository
First, clone the repository to your local machine using Git. Open your terminal and run:
```bash
git clone https://github.com/username/repository-name.git
cd repository-name
```
This will download the project files to your local directory and navigate into it.


2. Install Dependencies
Now that you've cloned the repo, install the project dependencies (which are listed in the package.json file) by running:
Frontend (React)
```bash
npm install
```
Backend(Express.js)
```bash
cd server
npm install
```
3. Create .env file in /server:
```bash
cp server/.env.example server/.env
```
Edit server/.env with MongoDB URI

4. Run the Development Server
To start the project locally, use the following command:
Start Backend Server
```bash
cd server
node server.js
```
Start Frontend (New Terminal)
```bash
npm run dev
```
This will launch the development server, and your project will be accessible at http://localhost:3000 (or a different port if configured).
