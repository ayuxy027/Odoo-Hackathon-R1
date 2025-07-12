# 📄 Product Requirements Document (PRD)

## Project Name: **StackIt – Minimal Q&A Forum Platform**  
**Version**: 1.0  
**Prepared By**: Ayush Yadav  
**Date**: July 2025

---

## 1. Introduction

### 1.1 Purpose  
The goal of StackIt is to develop a lightweight, community-driven question-and-answer platform that enables structured knowledge sharing and collaborative problem-solving. The application emphasizes simplicity, clarity, and ease of use—targeted for users seeking fast, contextual help from peers.

### 1.2 Scope  
StackIt will allow users to post questions, submit formatted answers, vote, and engage with community interactions. The platform includes role-based access, a responsive UI, notification handling, and robust backend APIs using a local relational database for data storage.

### 1.3 Stakeholders
- End Users (Students, Developers, Hobbyists)
- Product Development Team
- Odoo Hackathon Review Committee

---

## 2. Objectives & Success Metrics

### 2.1 Objectives
- Enable question creation with rich formatting
- Provide seamless answer submission and acceptance flow
- Support upvoting/downvoting for community moderation
- Implement real-time and offline support where feasible
- Ensure compliance with local-first, no-BaaS architecture

### 2.2 Success Metrics
- Functional Q&A workflows (CRUD complete)
- Real-time updates reflected across sessions
- Responsive UI across desktop and mobile
- No reliance on cloud DBs (Firebase, Supabase, etc.)
- Submitted codebase with video walkthrough within deadline

---

## 3. Target Users

| User Type | Description |
|-----------|-------------|
| Guest     | Can browse questions and answers |
| Registered User | Can post, vote, tag, and answer questions |
| Moderator/Admin | Can moderate content|

For credntials just have username for guest as guest and password as guest123
same for admin as admin and password as admin123 and for registered user as user and password as user123

---

## 4. Product Features

### 4.1 Questions Module
- Create a new question with title, description, and tags
- Description supports full formatting (rich text editor)
- View question listings, filterable by tag or search

### 4.2 Answers Module
- Submit answers to any public question
- Rich formatting supported for answers
- Allow question owner to mark a single answer as accepted

### 4.3 Voting System
- Upvote/downvote answers and questions
- Show live vote count to users

### 4.4 Tagging System
- Multi-select tagging component for each question
- Allow browsing/filtering via tags

### 4.5 Notification System
- Bell icon displaying real-time notifications
- Notifications for:
  - Received answers
  - Comments on answers
  - Mentions via @username
- Unread notification indicator and dropdown UI

---

## 5. Technical Requirements

### 5.1 Frontend
- Built using React with component-based architecture
- Feature-wise folder organization
- Routing layer with dynamic views
- Responsive UI via TailwindCSS/Bootstrap
- API communication layer abstracted for flexibility

### 5.2 Backend
- Developed using Node.js and Express
- SQLite used as a local relational database
- Modular folder structure per feature
- Middleware for request validation
- RESTful API design with versioning potential

### 5.3 Database
- SQLite (file-based local DB)
- Relational schema:
  - Users
  - Questions
  - Answers
  - Tags
  - Notifications

### 5.4 System Architecture

```
Frontend ↔ Backend ↔ SQLite DB
↑          ↑
User       APIs
```

---

## 6. Folder Structure (Abstracted)

### Frontend

- **App Layer** – App root & providers  
- **Features** – Questions, Answers, Notifications, Auth  
- **Components** – UI blocks per feature  
- **Routes** – All dynamic/static pages  
- **Lib** – API utils, shared constants  
- **Styles** – Global and component styles  

### Backend

- **Features** – User, Questions, Answers, Notifications  
- **DB** – SQLite config and connection logic  
- **Middleware** – Request validation  
- **Utils** – Shared helpers (slug generation, etc.)  
- **Root** – Entry point and main routing  

---

## 7. Constraints & Compliance

| Requirement                          | Compliance |
|-------------------------------------|------------|
| Local database only                 | ✅ SQLite  |
| No backend-as-a-service (BaaS)      | ✅ Confirmed |
| Offline/local support               | ✅ Service worker optional |
| Git-based team version control      | ✅ Shared repo |
| Modular file architecture           | ✅ Implemented |
| Clean responsive UI                 | ✅ Tailwind/Bootstrap |
| No blind AI usage                   | ✅ AI-reviewed code only |

---

## 8. Testing Plan

- Input validation testing (form length, empty fields)
- Manual user testing for:
  - Asking and answering questions
  - Voting system
  - Notification triggers
- Backend response testing using Postman or Swagger
- Optional: Jest for frontend components or controller logic

---

## 9. Deployment Strategy

- Run locally via `node` or `vite` dev server
- SQLite used in development and production
- Simple `npm start` / `vite` workflow
- No cloud dependency

---

## 10. Demo Deliverables

- Video Duration: **5–7 minutes**
- Content Focus: **Product functionality over code**
- Format: Screen-recorded, voice-narrated (optional captions)
- Deadline: **Within 1 hour of hackathon close**
- Hosted Link: Google Drive or YouTube (public access enabled)

---

## 11. Appendix

### A. Mockup Link  
[Excalidraw UI Mockup](https://link.excalidraw.com/l/65VNwvy7c4X/9mhEahV0MQg)

### B. GitHub Repo (To be added)

---
