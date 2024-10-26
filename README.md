# CafDS (Cafeteria Digital Signage)
***WORK IN PROGRESS***

The project is a digital signage system designed for a school cafeteria, which displays current offers and other relevant information on a monitor. It consists of a client-side application built with Electron.js and a server-side application using Express.js.

Thanks to Felixmax_ for providing the starting code/concept. Now I (Logilype) am the only one working on it and I am commited to finishing this project. ETA for the initial 1.0 version is mid November 2024.

### Key Features:

1. **Client-Side Application:**
   - The client application is an Electron.js app that runs on a local machine, displaying cafeteria offers and other content in full-screen mode.
   - It cycles through different pages, such as offers and news, based on a configurable interval.
   - The client fetches data from the server to display current offers and other information.
   - Example: ![2024-10-26 14_24_02-Cafeteria Angebote](https://github.com/user-attachments/assets/7168fe0b-71e8-4c02-b3c1-a2832463e460)

2. **Server-Side Application:**
   - The server is built with Express.js and serves content to the client application.
   - It provides endpoints to fetch and update settings, manage offers, and serve static files like images and HTML pages.
   - The server also handles user authentication for accessing the dashboard where offers and settings can be managed.

3. **Dashboard:**
   - An administrative dashboard allows users to manage offers, including adding, editing, and deleting entries.
   - The dashboard also provides options to upload media files and configure settings like page switch intervals and offer display durations.
   - Example: ![Screenshot 2024-10-26 at 14-22-16 CafDS Dashboard - Angebote bearbeiten](https://github.com/user-attachments/assets/b001110a-ddeb-4158-9c08-ca23caacbcbf)

4. **Data Management:**
   - Offers and settings are stored in JSON files on the server, which the client fetches to display the latest information.
   - The server processes these files to ensure only visible offers are sent to the client.

5. **User Interface:**
   - The user interface is designed to be simple and intuitive, with a focus on displaying information clearly and attractively.
   - The system uses HTML, CSS, and JavaScript to render the content, with a consistent design theme across different pages.

### Planned features:

- Audit log system for tracking changes, meaning which user made what changes in the dashboard.
- Language selector (I have marked the part in settings that it's a placeholder.)
- Edit menu table
- Manage menu entries and sort by type (i.e. cafeteria menu, ToGo menu, salads etc.)
- Manage advertisements to display on the monitor (i.e. a class in the school is going to sell cakes in the break on a particular day)

### How It Works:

- The client application starts in full-screen mode and loads the initial page, which displays the current offers.
- It periodically switches between different pages, such as offers and news, based on the configured interval.
- The server provides the necessary data and media files to the client, ensuring the displayed content is up-to-date.
- Administrators can log into the dashboard to manage offers and settings, ensuring the system remains relevant and accurate.

This project is a comprehensive solution for digital signage in a school cafeteria, providing a dynamic and engaging way to present information to students and staff.
