# WATT'S UP

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Screenshot and Demo](#screenshot-and-demo)


## Introduction

Watts Up is a comprehensive community-driven EV charging network that connects EV owners with private and public charging stations all across the nation. it leverages smart scheduling, dynamic pricing features, voice detection, and AI-driven predictions to optimise charging time, reducing long wait times and enhancing user experience. 

## Features

- **Search & Book Chargers**: Find closest available chargers based on your location, vehicle model and battery needs.
- **Peer-to-Peer sharing**: Rent out private EV charges to and from community members in your city.
- **Dynamic Pricing**: Benefit from adaptive pricing that reflects real-time demand and supply.
- **Route Optimisation**: Get guided directions with estimated arrival times using Google Maps API.
- **Voice Activation**: Enjoy hands-free commands to book and change your booking while keeping you away from your phone while driving.
- **QR Scanning**: Enjoy seamless on-site activation via QR codes, meaning no need for a wifi connection to charge your vehicle.
- **Predictive Queue Management**: Experience reduced wait times with AI-predicted queue management and virtual waitlists .

## Technologies Used

- **Frontend**: ReactJS and NextJS
- **Backend**: Node.js, Express.js, Flask, and Django
- **Database**: MongoDB
- **Other Tools**: Google Maps API and OpenAI API

## Getting Started

Follow these instructions to set up the project locally.

### Prerequisites

Ensure you have the following installed:

- Node.js
- Python
- MongoDB
- Flask
- Django

### Installation

1. **Clone the repository**:

   ```bash
   git clone https://github.com/hieuletainguyen/DeltahackXI.git
   cd DeltahackXI
   ```
2. **Create virtual environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Install backend dependencies**:

   ```bash
   cd backend
   npm install
   ```

4. **Install client dependencies**:

   ```bash
   cd ../client
   npm install
   ```

5. **Install server dependencies**:
   ```bash
   cd ../server
   npm install
   ```

6. **Set up environment variables**:

   Create a `.env` file in the `server`, `python`, `backend` and `client` directories 
   files.

   - In `server` directory:
     ```.env
      GOOGLE_MAPS_API_KEY=
      MONGODB_URL=
     ```

    - In `python` directory:
      ```.env
      OPENAI_API_KEY=
      ```
  
    - In `client` directory:
      ```.env
      GOOGLE_MAPS_API_KEY=
      ```
  
    - In `backend` directory:
      ```.env
      MONGODB_URI=
      SECRET_KEY=
      ```
   

### Running the Application

1. **Start the backend**:

   ```bash
   cd backend
   python3 manage.py runserver
   ```

2. **Start the client**:

   ```bash
   cd ../client
   npm run dev
   ```

3. **Start the server**:

   ```bash
   cd ../server
   npm start
   ```

4. **Start the python**:

   ```bash
   cd ../python
   sudo python3 voice_chat.py
   ```

5. **Connect to the mongoDB**

6. Open your browser and navigate to `http://localhost:3000`.

## Screenshot and Demo

### Application Screenshot

<div align="center">
  
<img width="587" alt="Screenshot 2025-01-14 at 10 38 09 AM" src="https://github.com/user-attachments/assets/aa9b5655-8bbc-4c1b-9622-136edb957e08" />

<label> Sign up Page </label>

<img width="571" alt="Screenshot 2025-01-14 at 10 38 01 AM" src="https://github.com/user-attachments/assets/53f4d507-84a0-4f38-a517-016f757dbcac" />

<label> Login Page </label>

<img width="537" alt="Screenshot 2025-01-14 at 10 39 20 AM" src="https://github.com/user-attachments/assets/24ad6c07-9cb7-4d17-9ed6-25efe5520898" />

<label> User Profile </label>

<img width="534" alt="Screenshot 2025-01-14 at 10 39 29 AM" src="https://github.com/user-attachments/assets/8a016c7d-cd47-4e34-9dad-d695a1179a7c" />

<label> Customer </label>

<img width="537" alt="Screenshot 2025-01-14 at 10 39 49 AM" src="https://github.com/user-attachments/assets/af5a9d39-54e9-4c87-9f64-19b9d2e767ab" />

<label> Scan QR code </label>

<img width="788" alt="Screenshot 2025-01-14 at 10 37 04 AM" src="https://github.com/user-attachments/assets/07b929ca-18d1-4123-b2b7-a69f5414e0f3" />

<label> Result nearest station </label>

<img width="643" alt="Screenshot 2025-01-14 at 10 37 34 AM" src="https://github.com/user-attachments/assets/967746c9-268d-4d87-bf28-832a5a3cd8b3" />

<label> Path to the station </label>

### Demo Video
<div align="center">
  
[![Watts up demo](http://markdown-videos-api.jorgenkh.no/youtube/guEpEY4YZPY)](https://youtu.be/guEpEY4YZPY)
</div>
<p align="center"><em>Click the image above to watch the demo video</em></p>


</div>

<h2 align="center"> Tools We Have Used and Learned In This Project</h2>
<p align="center">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" alt="vscode" width="45" height="45"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/bash/bash-original.svg" alt="bash" width="45" height="45"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg" width="45" height="45"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg" width="45" height="45"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="45" height="45"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" width="45" height="45"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg" width="45" height="45"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg" width="45" height="45"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg" width="45" height="45"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg" width="45" height="45"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg" width="45" height="45"/>

<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postman/postman-original.svg" width="45" height="45"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-plain-wordmark.svg" width="45" height="45"/>
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-plain-wordmark.svg" width="45" height="45"/>
<img src="./assets/openai.svg" width="45" height="45"/>
</p>

<div align="center">
  
Thank you for checking out WATT'S UP! 

</div>


