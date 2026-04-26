# 💬 MERN Real-Time Chat Application

A full-stack **real-time chat application** built using the MERN stack and Socket.IO.
It enables seamless communication with **one-to-one messaging, group chats, media sharing, and real-time updates**.

Designed with a **modern UI and production-style backend architecture**, focusing on reliability, clean code, and user experience.

---

## 🚀 Live Demo

🔗 Frontend: https://mern-chat-app-iota-seven.vercel.app/
🔗 Backend: https://mern-chat-app-8oxm.onrender.com

---

## ✨ Key Features

### 👤 Authentication

* JWT-based Login & Signup
* Protected routes
* Secure user sessions

---

### 💬 Real-Time Communication

* One-to-One Messaging
* Group Chat Support
* Online / Offline Presence
* Typing Indicators
* Real-time message delivery (Socket.IO)

---

### 📩 Messaging System

* Persistent chat history (MongoDB)
* Image sharing (Cloudinary)
* Optimistic UI updates
* Message edit & delete
* Message translation feature 🌍

---

### 👥 Group Management

* Create group chats
* Rename groups
* Add / Remove members
* Leave group

---

### 🎨 Frontend UI

* Responsive layout
* Clean modern chat interface
* Dark mode UI 🌙
* User search
* Profile dropdown

---

## 🛠 Tech Stack

### Frontend

* React.js
* Axios
* Socket.IO Client
* Tailwind CSS

### Backend

* Node.js
* Express.js
* MongoDB + Mongoose
* Socket.IO
* JWT Authentication

---

## ⚙️ Environment Variables

Create a `.env` file in the backend:

```
MONGO_URI=
JWT_SECRET=
PORT=
CLOUDINARY_NAME=
CLOUDINARY_KEY=
CLOUDINARY_SECRET=
```

Create a `.env` file in the frontend:

```
VITE_API_URL=
```

---

## 📂 Project Structure

```
/frontend
  /src
    /components
    /pages
    /api
    /constants

/backend
  /controllers
  /routes
  /models
  /config
```

---

## 🚀 Getting Started

### 1️⃣ Clone the repository

```
git clone https://github.com/your-username/your-repo-name.git
```

### 2️⃣ Install dependencies

```
cd backend
npm install

cd ../frontend
npm install
```

### 3️⃣ Run the app

```
# backend
npm run dev

# frontend
npm run dev
```

---

## 🧠 Highlights (Why this project stands out)

* Real-time communication using Socket.IO
* Clean and modular backend architecture
* Production-ready practices (env config, API separation)
* Scalable chat system design
* Thoughtful UI/UX implementation

---

## 👨‍💻 Author

**Siddharth Bhandari**
Aspiring Full Stack Developer

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
