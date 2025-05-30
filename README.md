![image](https://github.com/user-attachments/assets/af26bca9-7f0d-4018-9e6a-0120a471546d)# Rikimi

🌿 I am passionate about integrating technology into my daily life to make things easier and more efficient in an increasingly fast-paced world. Alongside my full-time job from 8 to 5, I have a strong desire to learn Japanese. However, keeping up with vocabulary and grammar from my frequent classes (three to five times a week) is challenging. To overcome this, I want to develop an application that makes learning Japanese more accessible, helping me retain words and grammar while allowing me to manage my time effectively and maintain a balanced, lighter lifestyle.

🧭 Global Layout Structure
* Top Navigation Bar
    * Logo + App Title (left, with a Rikimi icon)
    * 🔍 Global Search bar (centered, responsive)
    * Icon profile (right)
    * [Optional] Dark/light toggle, settings
* Sidebar (Mobile collapsible)
    * Dashboard
    * Books
    * Notes
    * Practice Hub
    * JLPT Planner
    * Manage Questions

📄 Documents Page (Books & Chapters)
UI:
* Sidebar / Tab layout (desktop) → Collapsible on mobile
* Grid/list of books (e.g., Minna no Nihongo I/II, Kanji N5)
    * 📚 Book Cards:
        * Book cover icon, title
        * Click → load list of chapters
* Chapter List
    * 🗂 Chapter Cards or List with:
        * Title
        * JLPT Level (badge like N5)
        * Number of words/grammar points
        * Click → shows vocabulary & grammar
Chapter Detail View
* Tabs or sections:
    * 📘 Vocabulary Table
    * ✏️ Grammar Table
* Each row:
    * Vocabulary: Kanji | Hiragana | Meaning | Example
    * Grammar: Point | Meaning | Example
Add / Import Word
* ➕ Floating Button or UI Card:
    * Add Chapter → modal form (title, book, level)
    * Add Word → inline form fields
    * 📥 Download Excel Template
    * 📤 Upload Excel File

🎮 Practice Hub Page
Tabs or Cards per Game:
Each one is in its own visual card or tab.
🃏 Flashcard Mode
* Front: Kanji + Hiragana
* Flip → shows Meaning + Example
* Animation on flip (framer-motion or CSS flip)
* Next / Previous buttons
⏱️ Timed Challenge
* Show random vocab
* Multiple choices or drag-match
* Timer countdown bar (top)
* Score + Review wrong answers
📝 Input Test
* Show English/Hiragana
* Input box to enter correct Kanji (or vice versa)
* Submit → show ✅/❌
* Cute success/fail icon (🎉 / 😿)
🧪 JLPT-Style Test
* 20 Questions (random or chapter-based)
* Radio buttons or cards
* Show result screen with 🎯 total score

📊 JLPT Information Page
Layout:
* Tabbed layout or Grid:
    * N5 → N1 levels as tabs or horizontal nav
Inside each level:
* 📘 Vocabulary: count + progress bar
* ✏️ Grammar: count + progress bar
* 🈶 Kanji: count + progress bar
* Use cards or charts for visual feedback
* Cute emojis/icons next to each skill type
Optionally:
* ✅ Show user progress if they’ve studied words/grammar/kanji
* 📌 Button: “Start Practice for N4 Vocabulary”

📱 Mobile Design Suggestions
* Sticky bottom nav bar with icons for key sections:
    * 🏠 Home / Docs
    * 🎮 Practice
    * 🔍 Search
    * 📊 JLPT
    * ➕ Add
* Use rem/% for fonts/sizing to keep scaling responsive
* Touch-friendly buttons & forms (min 48px height)
* Collapse menus into accordions/tabs on small screens

# 🎯 Milestones

## ✅ Phase 1: General
Focus on foundational features for language learning and test preparation.

### Vocabulary & Grammar Search
Enable search functionality for vocabulary, grammar points, and class notes.

### Class Notes Storage
Store and organize grammar explanations and vocabulary from classes.

### Practice Test System
Allow users to take JLPT-style practice tests and track their scores.

## 🔐 Phase 2: Personalization
Introduce user-specific features and a tracking mechanism.

### Authentication & Authorization
User registration, login, roles, and access control.

### Progress Tracking System
Track user performance, test history, and learning progress over time.

### Personalized Dashboard
Display current level, strengths, and weak areas based on test results.

## 🤖 Phase 3: AI-Powered Features
Enhance the platform with intelligent agents and recommendation systems.

### AI Exercise Recommender
Recommend practice exercises tailored to the user's weak points and goals.

### Chatbot Assistant
Interactive chatbot to help explain grammar, vocabulary, or schedule tests.

Here's the image chart showing your project phases:
https://files.oaiusercontent.com/file-7R1e1KhGMUijcCpRg9fo5G?se=2025-05-30T06%3A56%3A31Z&sp=r&sv=2024-08-04&sr=b&rscc=max-age%3D299%2C%20immutable%2C%20private&rscd=attachment%3B%20filename%3Dc8623e09-0f74-4c83-a525-0d6f592facbc&sig=9iTdcZZZxAvrbV0B1AIXbcdJ8RJqsvRjWDoNw6uf8zo%3D

Phase 1: General – Ends on 10 June 2025

Phase 2: Personalization – Ends on 10 July 2025

Phase 3: Apply AI Agent – Ends on 10 August 2025


