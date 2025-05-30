# Rikimi

🌿 I am passionate about integrating technology into my daily life to make things easier and more efficient in an increasingly fast-paced world. Alongside my full-time job from 8 to 5, I have a strong desire to learn Japanese. However, keeping up with vocabulary and grammar from my frequent classes (three to five times a week) is challenging. To overcome this, I want to develop an application that makes learning Japanese more accessible, helping me retain words and grammar while allowing me to manage my time effectively and maintain a balanced, lighter lifestyle.

🧭 Global Layout Structure
* Top Navigation Bar
    * Logo + App Title (with a 📘 or 🎌 icon)
    * 🔍 Global Search bar (centered, responsive)
    * 📄 “Documents”, 🎮 “Practice”, 📊 “JLPT Info” tabs or icons
    * [Optional] Dark/light toggle, settings
* Sidebar (Mobile collapsible)
    * 📘 Book List
    * 🎮 Practice Hub
    * 📊 JLPT Info
    * 🗂 Upload Data (Exercise + Questions)

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

🧩 Suggested Component Map (Lovable UI Generation)
Component	Description
BookCard	Show book icon, title, and count of chapters
ChapterListItem	Chapter title, JLPT badge
WordCard	Flip card (front: word, back: meaning + example)
GrammarCard	Grammar rule, usage, example
FlashcardGame	Flip logic, next/prev
TimedQuiz	Timer logic, score tracker
JLPTStatCard	Visual card for vocab/grammar/kanji counts
ProgressBar	For JLPT requirement vs user learned count
UploadSection	Drag & drop Excel, file preview
SearchBox	Topbar search input, filter type (word, grammar, kanji)

🎨 Design Tips (Cute and Green)
* Theme Color: Focus green (#38B48B) for buttons, links, highlights
* Secondary Colors: Light beige or soft gray backgrounds
* Icons: Use emoji or SVG:
    * 📘 Word
    * ✏️ Grammar
    * 🈶 Kanji
    * 🎮 Games
    * 📊 Stats
    * 🔍 Search
    * 📥 Upload
    * 📤 Download
