# QuantumLearn AI 

### AI-Based Interactive Quantum Algorithm Learning Platform

> An intelligent, interactive, and personalized learning platform designed to help students, researchers, and professionals learn Quantum Computing through structured education, hands-on quantum circuit experimentation, practice, visualization, and AI-powered guidance.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?logo=google)](https://ai.google.dev/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![License](https://img.shields.io/badge/License-MIT-green)](#license)

---

## Table of Contents

* [Overview](#-overview)
* [Problem Statement](#-problem-statement)
* [Vision](#-vision)
* [Objectives](#-objectives)
* [Key Features](#-key-features)
* [Platform Architecture](#-platform-architecture)
* [Application Workflow](#-application-workflow)
* [Core Modules](#-core-modules)

  * [Landing Page](#1-landing-page)
  * [Authentication](#2-authentication--user-profile)
  * [AI-Powered Dashboard](#3-ai-powered-dashboard)
  * [Quantum Learning Platform](#4-quantum-learning-platform)
  * [Practice and Assessment](#5-practice-and-assessment)
  * [Quantum Lab](#6-quantum-lab)
  * [AI Tutor](#7-ai-tutor)
  * [Learning Analytics](#8-learning-analytics)
  * [Progress Tracking](#9-progress-tracking)
  * [Resources](#10-resources)
* [Quantum Computing Curriculum](#-quantum-computing-curriculum)
* [AI Intelligence Layer](#-ai-intelligence-layer)
* [Database Architecture](#-database-architecture)
* [Technology Stack](#-technology-stack)
* [Project Structure](#-project-structure)
* [Authentication Flow](#-authentication-flow)
* [AI Tutor Architecture](#-ai-tutor-architecture)
* [Quantum Lab Architecture](#-quantum-lab-architecture)
* [Learning Analytics Architecture](#-learning-analytics-architecture)
* [API Architecture](#-api-architecture)
* [Environment Variables](#-environment-variables)
* [Installation](#-installation)
* [Running Locally](#-running-locally)
* [Production Build](#-production-build)
* [Deployment](#-deployment)
* [GitHub Collaboration](#-github-collaboration)
* [Security Considerations](#-security-considerations)
* [Current Prototype Status](#-current-prototype-status)
* [Future Roadmap](#-future-roadmap)
* [Use Cases](#-use-cases)
* [Target Users](#-target-users)
* [Educational Approach](#-educational-approach)
* [Why QuantumLearn AI?](#-why-quantumlearn-ai)
* [Project Goals](#-project-goals)
* [Contributing](#-contributing)
* [License](#-license)
* [Acknowledgements](#-acknowledgements)
* [Author](#-author)

---

# Overview

**QuantumLearn AI** is an AI-based interactive learning platform focused on making **Quantum Computing education more accessible, practical, visual, and personalized**.

Quantum computing is rapidly becoming an important area of computer science, artificial intelligence, optimization, cryptography, and scientific research. However, learning quantum computing can be difficult because students often have to combine:

* Mathematical concepts
* Quantum physics fundamentals
* Programming
* Quantum circuit design
* Algorithmic reasoning
* Visualization
* Simulation tools
* External educational resources

QuantumLearn AI aims to bring these components together into a **single integrated learning environment**.

Instead of learning Quantum Computing only through theoretical material, users can:

1. Learn concepts through structured lessons.
2. Interact with quantum concepts.
3. Build and manipulate quantum circuits.
4. Simulate quantum operations.
5. Visualize quantum states and measurements.
6. Practice through assessments.
7. Track their learning progress.
8. Analyze their performance.
9. Ask an AI Tutor questions at any point.
10. Receive personalized learning guidance.

The platform is designed around the principle:

> **Learn → Interact → Experiment → Practice → Analyze → Improve**

---

# Problem Statement

## AI-Based Interactive Quantum Algorithm Learning Platform

Quantum computing education is currently fragmented across textbooks, university courses, online lectures, documentation, simulators, coding platforms, and research papers.

Beginners frequently face problems such as:

* Difficulty understanding abstract quantum concepts.
* Lack of interactive visualization.
* Difficulty connecting theory with actual quantum circuits.
* Limited personalized guidance.
* Lack of structured progression from beginner to advanced topics.
* Difficulty understanding quantum algorithms.
* Limited feedback on learning performance.
* Difficulty identifying weak areas.
* Lack of a unified environment for learning and experimentation.

QuantumLearn AI addresses these problems by combining:

**Structured Curriculum + Interactive Learning + Quantum Simulation + Practice + Analytics + AI Guidance**

into one platform.

---

# Vision

The long-term vision of QuantumLearn AI is to become a comprehensive educational ecosystem for Quantum Computing where users can move from **zero knowledge to advanced quantum algorithms and experimentation** inside one platform.

The platform aims to support:

### Beginners

Build a strong foundation in quantum computing.

### Students

Follow a structured curriculum and monitor academic progress.

### Researchers

Experiment with circuits, algorithms, and quantum concepts.

### Professionals

Refresh quantum computing fundamentals and explore advanced algorithms.

### Educators

Potentially use structured content, exercises, and interactive experiments as teaching material.

---

# Objectives

QuantumLearn AI is designed around the following objectives:

* Provide a structured Quantum Computing learning path.
* Reduce the difficulty of learning abstract quantum concepts.
* Combine theory with hands-on experimentation.
* Provide interactive quantum circuit construction.
* Provide quantum-state and measurement visualization.
* Provide AI-powered educational assistance.
* Track individual learning activity.
* Analyze user performance.
* Identify learning gaps.
* Recommend what the learner should study next.
* Provide practice and assessments.
* Maintain persistent learning progress.
* Build a scalable educational architecture for future quantum-computing capabilities.

---

# Key Features

## AI-Powered Learning

* AI Tutor powered by Google Gemini.
* Context-aware educational assistance.
* Persistent conversations.
* AI-based explanations.
* Personalized guidance.
* Suggested next learning topics.
* Error handling and retry mechanisms.
* AI-assisted learning analysis.

---

## Structured Quantum Curriculum

The platform is designed around a progressive curriculum:

```text
Beginner
   ↓
Foundation
   ↓
Intermediate
   ↓
Advanced
   ↓
Quantum Algorithms
   ↓
Practical Experimentation
```

Topics include:

* Qubits
* Quantum states
* Superposition
* Measurement
* Quantum gates
* Bloch sphere
* Entanglement
* Bell states
* Quantum teleportation
* Quantum interference
* Quantum algorithms
* Quantum circuit construction
* Advanced quantum computing concepts

---

## Interactive Quantum Lab

The Quantum Lab allows users to experiment with quantum circuits.

Current simulator capabilities include:

* 1–5 qubits
* Multiple circuit columns
* X gate
* Y gate
* Z gate
* H gate
* S gate
* T gate
* CNOT gate
* CZ gate
* SWAP gate
* Undo
* Redo
* Circuit history
* Measurement
* Shot-based measurement
* Circuit templates
* Algorithm templates
* Bloch sphere visualization
* Measurement histogram
* Quantum Tutor integration
* Circuit export

---

## Learning Analytics

The platform tracks learning activity and provides analytical insights such as:

* Overall learning progress
* Chapter-level progress
* Lesson completion
* Practice performance
* Test performance
* Question-level performance
* Scores
* Percentages
* Learning activity
* Weak areas
* Recommended topics

The goal is to transform raw learning activity into **actionable educational insights**.

---

## Practice & Assessment

Users can practice concepts through question-based activities.

Practice activity can include information such as:

* Lesson
* Chapter
* Difficulty
* Score
* Total questions
* Percentage
* Answers
* Question IDs

This information can then contribute to the user's learning analytics.

---

## User Accounts

QuantumLearn AI supports authenticated users and personalized experiences.

The registration system is designed to capture relevant learner information such as:

* Name
* Age
* Gender
* City
* Role
* Institute
* Branch of study
* Email / phone
* Password

Supported roles include:

* Student
* Tutor
* Researcher

The information can be used to provide a more personalized educational experience.

---

# Platform Architecture

At a high level, QuantumLearn AI follows this architecture:

```text
                         ┌─────────────────────┐
                         │       USER          │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    NEXT.JS WEB UI   │
                         │                     │
                         │ Landing             │
                         │ Authentication     │
                         │ Dashboard           │
                         │ Learn               │
                         │ Practice            │
                         │ Quantum Lab         │
                         │ AI Tutor            │
                         └──────────┬──────────┘
                                    │
                  ┌─────────────────┼─────────────────┐
                  │                 │                 │
                  ▼                 ▼                 ▼
          ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
          │   SUPABASE   │  │  AI SERVICES │  │ QUANTUM LAB  │
          │              │  │              │  │              │
          │ Auth         │  │ Gemini       │  │ Circuit      │
          │ Database     │  │ AI Tutor     │  │ Simulator    │
          │ User Data    │  │ Analysis     │  │ Visualization│
          └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                 │                 │                 │
                 └─────────────────┼─────────────────┘
                                   │
                                   ▼
                         ┌─────────────────────┐
                         │ LEARNING INTELLIGENCE│
                         │                     │
                         │ Progress            │
                         │ Performance         │
                         │ Weak Areas           │
                         │ Recommendations     │
                         └─────────────────────┘
```

---

# Application Workflow

The overall user workflow is designed as:

```text
                    START
                      │
                      ▼
               ┌─────────────┐
               │ Landing Page│
               └──────┬──────┘
                      │
             ┌────────┴────────┐
             │                 │
             ▼                 ▼
          LOGIN             SIGN UP
             │                 │
             └────────┬────────┘
                      ▼
                  DASHBOARD
                      │
        ┌─────────────┼──────────────┐
        │             │              │
        ▼             ▼              ▼
      LEARN        PRACTICE      QUANTUM LAB
        │             │              │
        ▼             ▼              ▼
    LESSONS         TESTS         CIRCUITS
        │             │              │
        └─────────────┼──────────────┘
                      ▼
                 ACTIVITY DATA
                      │
                      ▼
               LEARNING ANALYTICS
                      │
                      ▼
               AI RECOMMENDATIONS
                      │
                      ▼
                  AI TUTOR
                      │
                      ▼
               NEXT LEARNING STEP
```

---

# Core Modules

## 1. Landing Page

The landing page introduces QuantumLearn AI and communicates the platform's purpose.

Major sections include:

* Hero section
* Problem statement
* Features
* Learning journey
* Learning roadmap
* Progress preview
* Quantum Lab preview
* AI Tutor preview
* Resources
* Final call-to-action
* Navigation
* Footer

The design focuses on communicating QuantumLearn AI as an interactive technology platform rather than a conventional static educational website.

---

# 2. Authentication & User Profile

Authentication is implemented using **Supabase Auth**.

The platform includes:

* Login
* Signup
* Authenticated dashboard
* User session handling
* Protected routes
* Logout
* User information
* Profile-based personalization
* Password recovery flow

The authentication layer is integrated with the application backend so that learning activity can be associated with individual users.

---

# 3. AI-Powered Dashboard

The dashboard acts as the user's central learning command center.

It provides a personalized overview of:

### Learning

* Overall learning progress
* Chapter-wise progress
* Lesson activity
* Completion information

### Practice

* Overall practice performance
* Test-level performance
* Question-level performance
* Score and percentage information

### Quantum Lab

* Circuit experimentation activity
* Quantum Lab usage
* Experiment-related insights

### AI Intelligence

The dashboard can use learning data to identify patterns and provide:

* Insights
* Weak areas
* Suggested topics
* Learning recommendations
* Next-step guidance

The dashboard is intended to continuously evolve as the user interacts with the platform.

---

# 4. Quantum Learning Platform

The learning system provides structured educational content.

Each learning path is organized into concepts, chapters, lessons, activities, and assessments.

A typical learning progression can look like:

```text
Quantum Computing Fundamentals
            │
            ▼
          Qubits
            │
            ▼
      Quantum States
            │
            ▼
       Superposition
            │
            ▼
        Measurement
            │
            ▼
      Quantum Gates
            │
            ▼
       Bloch Sphere
            │
            ▼
       Entanglement
            │
            ▼
        Bell States
            │
            ▼
    Quantum Teleportation
            │
            ▼
       Interference
            │
            ▼
   Quantum Algorithms
            │
      ┌─────┼─────┐
      ▼     ▼     ▼
 Deutsch   Grover   QFT
   ↓        ↓       ↓
Advanced Quantum Algorithms
```

---

# 5. Practice and Assessment

The Practice module allows learners to test their understanding.

Practice activity is connected to the learning system so that performance can contribute to the learner's overall profile.

The platform can record:

```text
Lesson
Chapter
Difficulty
Score
Total Questions
Percentage
Answers
Question IDs
```

This enables future analysis at multiple levels:

```text
Overall
   ↓
Chapter
   ↓
Test
   ↓
Question
```

This hierarchy makes it possible to identify not only that a learner is struggling, but potentially **where and why** they are struggling.

---

# 6. Quantum Lab

The Quantum Lab is one of the central interactive components of QuantumLearn AI.

It provides a visual environment for constructing quantum circuits.

## Supported Qubit Range

```text
1 Qubit
2 Qubits
3 Qubits
4 Qubits
5 Qubits
```

## Supported Gates

### Single-Qubit Gates

```text
X
Y
Z
H
S
T
```

### Multi-Qubit Gates

```text
CNOT
CZ
SWAP
```

## Circuit Controls

The simulator supports:

* Gate placement
* Circuit editing
* Undo
* Redo
* Circuit history
* Circuit templates
* Algorithm templates
* Measurement
* Multiple measurement shots

---

## Quantum Visualization

The Quantum Lab provides visual feedback through:

### Bloch Sphere

Used to visualize the state of a single qubit.

### Measurement Histogram

Used to visualize measurement results over multiple shots.

### Circuit Visualization

Used to understand the sequence of quantum operations.

---

## Quantum Tutor Integration

The Quantum Lab is designed to connect experimentation with education.

Instead of simply constructing circuits, learners can use AI assistance to understand:

* What a gate does.
* Why a circuit produces a specific result.
* What a measurement means.
* How a circuit can be improved.
* What concept should be studied next.

---

# 7. AI Tutor

The AI Tutor is the intelligent educational layer of QuantumLearn AI.

It is powered by **Google Gemini** through the application's server-side API architecture.

The Tutor can help users:

* Understand quantum concepts.
* Explain difficult topics.
* Answer questions.
* Explain circuits.
* Clarify mistakes.
* Guide users through lessons.
* Recommend concepts to study.
* Support learning outside individual lessons.

---

## Persistent AI Conversations

The AI Tutor includes persistent conversations.

Conversation data is associated with the authenticated user.

The architecture includes:

```text
User
 │
 ▼
AI Conversation
 │
 ├── Message
 ├── Message
 ├── Message
 └── Message
```

This allows the Tutor experience to move beyond a temporary single-page chatbot.

---

## AI Tutor API

The main chat endpoint is:

```text
/api/ai-tutor/chat
```

Conversation management endpoints include:

```text
/api/ai-tutor/conversations
/api/ai-tutor/conversations/[id]
```

The backend performs authentication and validates the Gemini API configuration before processing requests.

---

# 8. Learning Analytics

QuantumLearn AI is designed to treat learning as a continuously measurable process.

The platform can collect activity from multiple sources:

```text
                 USER ACTIVITY
                      │
        ┌─────────────┼─────────────┐
        │             │             │
        ▼             ▼             ▼
      LEARN        PRACTICE      QUANTUM LAB
        │             │             │
        └─────────────┼─────────────┘
                      ▼
                 DATA LAYER
                      │
                      ▼
              ANALYTICS ENGINE
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
       Progress    Performance  Weak Areas
          │           │           │
          └───────────┼───────────┘
                      ▼
                AI INSIGHTS
                      │
                      ▼
              RECOMMENDATIONS
```

---

# 9. Progress Tracking

Progress is not limited to a single percentage.

The platform is designed to track learning at multiple levels:

```text
User
 │
 ├── Overall Progress
 │
 ├── Chapter Progress
 │
 │    ├── Lesson 1
 │    ├── Lesson 2
 │    └── Lesson 3
 │
 ├── Practice
 │    ├── Tests
 │    └── Questions
 │
 └── Quantum Lab
      ├── Experiments
      └── Circuits
```

This enables personalized learning analytics rather than generic course completion.

---

# 10. Resources

The platform also provides a resources area intended to connect learners with additional educational material.

Future resources can include:

* Documentation
* Books
* Research papers
* Tutorials
* Quantum programming references
* Algorithm references
* External quantum-computing resources

---

# Quantum Computing Curriculum

QuantumLearn AI follows a progressive learning structure.

## Level 1 — Foundations

Topics include:

* Introduction to Quantum Computing
* Classical vs Quantum Computing
* Qubits
* Quantum states
* Computational basis
* Probability amplitudes
* Dirac notation
* Measurement fundamentals

---

## Level 2 — Core Quantum Concepts

Topics include:

* Superposition
* Measurement
* Quantum state representation
* Bloch sphere
* Unitary operations
* Quantum gates
* Single-qubit gates
* Multi-qubit systems
* Tensor products
* Quantum circuits

---

## Level 3 — Quantum Phenomena

Topics include:

* Entanglement
* Bell states
* Quantum interference
* No-cloning theorem
* Quantum teleportation
* Quantum communication concepts

---

## Level 4 — Quantum Algorithms

The platform is designed to progress toward major quantum algorithms including:

### Deutsch / Deutsch-Jozsa

Understanding quantum advantage through oracle-based computation.

### Grover's Algorithm

Understanding quantum search and amplitude amplification.

### Quantum Fourier Transform

Understanding the quantum equivalent of Fourier transformation and its role in advanced algorithms.

### Shor's Algorithm

Understanding quantum factoring and its relationship to modern cryptography.

---

## Level 5 — Quantum Optimization & Applications

Advanced topics can include:

* VQE
* QAOA
* Quantum optimization
* Quantum machine learning
* Quantum cryptography
* Quantum simulation
* Hybrid quantum-classical algorithms

---

# AI Intelligence Layer

QuantumLearn AI is not intended to use AI only as a chatbot.

The long-term architecture treats AI as an **intelligence layer across the platform**.

```text
                    USER
                     │
                     ▼
              USER ACTIVITY
                     │
       ┌─────────────┼─────────────┐
       │             │             │
       ▼             ▼             ▼
     LEARN        PRACTICE      QUANTUM LAB
       │             │             │
       └─────────────┼─────────────┘
                     ▼
              USER DATA LAYER
                     │
                     ▼
             LEARNING ANALYSIS
                     │
          ┌──────────┼──────────┐
          ▼          ▼          ▼
        Skills    Weaknesses  Progress
          │          │          │
          └──────────┼──────────┘
                     ▼
                AI ENGINE
                     │
       ┌─────────────┼─────────────┐
       ▼             ▼             ▼
    Insights     Recommendations   Tutor
       │             │             │
       └─────────────┼─────────────┘
                     ▼
              NEXT BEST ACTION
```

The objective is to eventually provide a **closed learning loop**:

```text
Learn
 ↓
Practice
 ↓
Measure
 ↓
Analyze
 ↓
Identify Weakness
 ↓
AI Recommendation
 ↓
Learn Again
```

---

# Database Architecture

Supabase acts as the main backend data platform.

The application uses database-backed user-specific information.

Important functional data areas include:

```text
Authentication
     │
     ▼
User Profile
     │
     ├── Learning Activity
     │
     ├── Practice Results
     │
     ├── AI Conversations
     │
     ├── AI Messages
     │
     └── Learning Analytics
```

---

## AI Conversation Data

The AI Tutor uses conversation-oriented data structures such as:

```text
ai_conversations
ai_messages
```

Conceptually:

```text
ai_conversations
       │
       ├── conversation_id
       ├── user_id
       ├── title
       └── timestamps
              │
              ▼
        ai_messages
              │
              ├── message_id
              ├── conversation_id
              ├── role
              ├── content
              └── timestamps
```

---

# Technology Stack

## Frontend

| Technology     | Purpose               |
| -------------- | --------------------- |
| Next.js        | Application framework |
| React          | UI architecture       |
| TypeScript     | Type-safe development |
| Tailwind CSS   | Styling               |
| Lucide React   | Interface icons       |
| React Markdown | AI response rendering |
| remark-gfm     | Markdown/GFM support  |

---

## Backend

| Technology         | Purpose                     |
| ------------------ | --------------------------- |
| Next.js API Routes | Server-side APIs            |
| Supabase           | Authentication and database |
| Supabase SSR       | Server-side authentication  |
| Google Gemini      | AI functionality            |

---

## Quantum Layer

The Quantum Lab provides an in-browser interactive quantum circuit environment containing:

* Circuit construction
* Quantum gate operations
* Measurement
* Shot simulation
* Bloch sphere visualization
* Histograms
* Circuit templates
* Algorithm templates

---

# Project Structure

A simplified representation of the project structure:

```text
quantumlearn-ai/
│
├── public/
│
├── src/
│   │
│   ├── app/
│   │   ├── api/
│   │   │   ├── ai-tutor/
│   │   │   │   ├── chat/
│   │   │   │   └── conversations/
│   │   │   │
│   │   │   └── practice/
│   │   │
│   │   ├── dashboard/
│   │   ├── learn/
│   │   ├── practice/
│   │   ├── quantum-lab/
│   │   ├── login/
│   │   ├── signup/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   │   ├── ai/
│   │   │   └── PersistentAITutor/
│   │   │
│   │   ├── landing/
│   │   │   ├── Hero
│   │   │   ├── FeaturesSection
│   │   │   ├── LearningJourney
│   │   │   ├── LearningRoadmap
│   │   │   ├── ProblemSection
│   │   │   ├── ProgressPreview
│   │   │   ├── QuantumLabPreview
│   │   │   ├── AITutorPreview
│   │   │   ├── ResourcesSection
│   │   │   └── FinalCTA
│   │   │
│   │   └── ...
│   │
│   └── lib/
│       ├── supabase-server.ts
│       └── supabase-browser.ts
│
├── supabase/
│   └── migrations/
│
├── .env.local
├── package.json
├── tsconfig.json
├── next.config.*
└── README.md
```

> The exact structure may evolve as the platform continues to expand.

---

# Authentication Flow

The authentication architecture follows:

```text
                USER
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
      LOGIN             SIGNUP
        │                 │
        └────────┬────────┘
                 ▼
          SUPABASE AUTH
                 │
                 ▼
          AUTHENTICATED
             SESSION
                 │
                 ▼
             DASHBOARD
                 │
                 ▼
       PERSONALIZED PLATFORM
```

Protected application areas require an authenticated user.

When a user is not authenticated and attempts to access protected functionality, the application can redirect the user toward authentication.

---

# AI Tutor Architecture

The AI Tutor follows a server-mediated architecture.

```text
USER
 │
 ▼
AI CHAT UI
 │
 ▼
Next.js API
 │
 ├── Authenticate User
 │
 ├── Validate Configuration
 │
 ├── Process Conversation
 │
 └── Request AI Response
 │
 ▼
Google Gemini
 │
 ▼
AI RESPONSE
 │
 ├── Save Message
 │
 └── Return to UI
```

This approach avoids exposing sensitive server-side configuration directly to the client.

---

# Quantum Lab Architecture

The Quantum Lab can be conceptually represented as:

```text
                 QUANTUM LAB
                      │
          ┌───────────┼───────────┐
          │           │           │
          ▼           ▼           ▼
       QUBITS       GATES      TEMPLATES
          │           │           │
          └───────────┼───────────┘
                      ▼
               CIRCUIT ENGINE
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       STATE       MEASUREMENT   HISTORY
          │           │           │
          ▼           ▼           ▼
     BLOCH SPHERE  HISTOGRAM    UNDO/REDO
          │           │
          └───────────┼───────────┘
                      ▼
                 AI TUTOR
```

---

# Learning Analytics Architecture

Learning data originates from different parts of the platform.

```text
                 USER
                   │
       ┌───────────┼───────────┐
       │           │           │
       ▼           ▼           ▼
    LESSONS     PRACTICE     LAB
       │           │           │
       ▼           ▼           ▼
  Completion     Results    Experiments
       │           │           │
       └───────────┼───────────┘
                   ▼
              DATABASE
                   │
                   ▼
          ANALYTICS PROCESSING
                   │
       ┌───────────┼───────────┐
       ▼           ▼           ▼
    Progress   Performance   Weakness
       │           │           │
       └───────────┼───────────┘
                   ▼
              AI INSIGHTS
                   │
                   ▼
          PERSONALIZED ACTION
```

---

# API Architecture

The application uses Next.js server-side API routes.

## AI Tutor

```text
POST /api/ai-tutor/chat
```

Used for AI Tutor interactions.

---

## Conversations

```text
GET    /api/ai-tutor/conversations
POST   /api/ai-tutor/conversations
GET    /api/ai-tutor/conversations/[id]
PATCH  /api/ai-tutor/conversations/[id]
DELETE /api/ai-tutor/conversations/[id]
```

> Exact supported HTTP methods may evolve with the implementation.

---

## Practice

```text
/api/practice
```

The practice API handles practice-related activity and stores relevant performance information.

---

# Environment Variables

Create a local environment file:

```text
.env.local
```

Typical configuration includes:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

If additional services are enabled, their credentials should also be configured through environment variables.

### Important

Never commit `.env.local` or private API keys to GitHub.

Make sure `.gitignore` contains:

```gitignore
.env
.env.local
.env*.local
```

---

# Installation

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* Git
* A Supabase project
* A Google Gemini API key

---

## Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/quantumlearn-ai.git
cd quantumlearn-ai
```

---

## Install Dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create:

```text
.env.local
```

Add the required credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
```

---

# Running Locally

Start the development server:

```bash
npm run dev
```

Open the application at:

```text
http://localhost:3000
```

---

# Production Build

To create a production build:

```bash
npm run build
```

Then start the production server:

```bash
npm start
```

---

# Deployment

QuantumLearn AI is designed as a production-oriented Next.js application.

A typical deployment architecture is:

```text
                    GitHub
                      │
                      ▼
                Deployment
                 Platform
                      │
                      ▼
                 Next.js App
                      │
          ┌───────────┴───────────┐
          │                       │
          ▼                       ▼
      Supabase                 Gemini
      Backend                   AI API
```

Before deploying, configure all required environment variables in the deployment platform.

Never place secret API credentials directly inside client-side code.

---

# GitHub Collaboration

QuantumLearn AI can be developed collaboratively using GitHub.

Recommended workflow:

```text
main
 │
 ├── feature/auth
 ├── feature/ai-tutor
 ├── feature/quantum-lab
 ├── feature/curriculum
 ├── feature/practice
 └── feature/dashboard
```

Recommended workflow:

```text
Create Branch
      ↓
Develop Feature
      ↓
Test Locally
      ↓
Commit
      ↓
Push
      ↓
Pull Request
      ↓
Code Review
      ↓
Merge
```

Avoid directly pushing experimental changes into the production branch.

---

# Security Considerations

QuantumLearn AI handles user accounts and learning data, therefore security is an important part of the architecture.

Important practices include:

### Environment Variables

API keys should remain server-side whenever possible.

### Authentication

Protected resources should verify the authenticated Supabase user.

### Database Security

Supabase Row Level Security should be used to ensure users can access only the data they are authorized to access.

### API Validation

Server-side endpoints should validate:

* Authentication
* Request data
* Required configuration
* Resource ownership

### Sensitive Information

Never commit:

```text
.env.local
API keys
Service-role keys
Private credentials
Database passwords
```

to the repository.

---

# Current Prototype Status

QuantumLearn AI has progressed beyond a simple landing-page prototype.

The current prototype includes a functioning ecosystem consisting of:

| Area                          | Status               |
| ----------------------------- | -------------------- |
| Landing Page                  | ✅ Implemented        |
| Navigation                    | ✅ Implemented        |
| Login                         | ✅ Implemented        |
| Signup                        | ✅ Implemented        |
| Supabase Authentication       | ✅ Implemented        |
| User Dashboard                | ✅ Implemented        |
| Learning Platform             | ✅ Implemented        |
| Practice Platform             | ✅ Implemented        |
| Practice Data Tracking        | ✅ Implemented        |
| Quantum Lab                   | ✅ Implemented        |
| Quantum Circuit Simulator     | ✅ Implemented        |
| Quantum Gate System           | ✅ Implemented        |
| Measurement                   | ✅ Implemented        |
| Bloch Sphere                  | ✅ Implemented        |
| Measurement Histogram         | ✅ Implemented        |
| Circuit History               | ✅ Implemented        |
| Undo / Redo                   | ✅ Implemented        |
| Circuit Templates             | ✅ Implemented        |
| Algorithm Templates           | ✅ Implemented        |
| AI Tutor                      | ✅ Implemented        |
| Persistent AI Conversations   | ✅ Implemented        |
| AI Conversation Database      | ✅ Implemented        |
| AI Learning Insights          | ✅ Implemented        |
| Progress Analytics            | ✅ Implemented        |
| User-specific Data            | ✅ Implemented        |
| Production Build              | ✅ Configured         |
| Deployment                    | ✅ Deployed Prototype |
| Advanced Curriculum Expansion | 🚧 Continuing        |
| Advanced AI Intelligence      | 🚧 Continuing        |
| Advanced Quantum Algorithms   | 🚧 Continuing        |

The platform should be considered an **active prototype/product-in-development**, with the core ecosystem already established and additional educational and intelligence capabilities continuing to evolve.

---

# Future Roadmap

QuantumLearn AI is designed to expand significantly beyond the current prototype.

## Phase 1 — Curriculum Expansion

Expand the curriculum from introductory concepts through advanced quantum computing.

```text
Beginner
   ↓
Intermediate
   ↓
Advanced
   ↓
Quantum Algorithms
   ↓
Research-Oriented Topics
```

---

## Phase 2 — Advanced Quantum Algorithms

Expand interactive learning and experimentation for:

* Deutsch-Jozsa
* Grover
* QFT
* Shor
* VQE
* QAOA
* Quantum Fourier-based algorithms
* Quantum optimization
* Quantum machine learning

---

## Phase 3 — Deeper AI Personalization

Develop stronger learner intelligence:

```text
User Activity
     ↓
Learning Profile
     ↓
Skill Assessment
     ↓
Knowledge Gaps
     ↓
AI Recommendation
     ↓
Personalized Learning Path
```

Potential capabilities include:

* Adaptive difficulty
* Personalized lesson sequencing
* Automated weak-topic detection
* Personalized revision
* AI-generated practice
* Personalized explanations
* Learning-path optimization

---

## Phase 4 — Advanced Quantum Simulation

Future development can expand the Quantum Lab with:

* Larger circuits
* More gates
* Advanced visualization
* State-vector visualization
* Circuit optimization
* Algorithm execution
* Quantum backend integration
* Real quantum hardware support

---

## Phase 5 — Research & Collaboration

Potential future capabilities:

* Research workspace
* Experiment saving
* Experiment comparison
* Circuit sharing
* Collaborative learning
* Instructor tools
* Research-oriented resources
* Community features

---

# Use Cases

## Student Learning

A student can:

```text
Study Concept
     ↓
Interact with Example
     ↓
Build Circuit
     ↓
Run Simulation
     ↓
Take Practice
     ↓
Analyze Result
     ↓
Ask AI Tutor
     ↓
Continue Learning
```

---

## Quantum Programming Practice

Learners can use the Quantum Lab to understand how quantum gates combine to form circuits and algorithms.

---

## Algorithm Education

Complex algorithms can be taught visually rather than purely mathematically.

---

## Self-Paced Learning

Users can progress through the curriculum according to their own pace.

---

## AI-Assisted Education

The AI Tutor can provide immediate educational support without requiring users to leave the platform.

---

# Target Users

QuantumLearn AI is primarily designed for:

### Students

Especially students from:

* Computer Science
* Artificial Intelligence
* Data Science
* Physics
* Mathematics
* Engineering

### Researchers

Users exploring quantum algorithms and quantum information.

### Professionals

Developers and technical professionals interested in learning quantum computing.

### Educators

Teachers and tutors who want interactive quantum-computing teaching material.

---

# Educational Approach

QuantumLearn AI follows an interactive learning philosophy.

Traditional learning often follows:

```text
Read → Memorize → Test
```

QuantumLearn AI aims to use:

```text
Understand
    ↓
Visualize
    ↓
Interact
    ↓
Experiment
    ↓
Practice
    ↓
Analyze
    ↓
Ask
    ↓
Improve
```

This is particularly important for Quantum Computing because many concepts are highly abstract.

For example, instead of only explaining a Hadamard gate mathematically, the learner can:

```text
Learn H Gate
     ↓
Place H on Qubit
     ↓
Run Circuit
     ↓
Measure
     ↓
Observe Probabilities
     ↓
Visualize State
     ↓
Ask AI Tutor Why
```

---

# Why QuantumLearn AI?

QuantumLearn AI attempts to solve a fundamental problem in quantum-computing education:

> **The gap between understanding quantum theory and actually experimenting with quantum systems.**

The platform brings multiple learning components together:

```text
                    QUANTUMLEARN AI
                          │
       ┌──────────────────┼──────────────────┐
       │                  │                  │
       ▼                  ▼                  ▼
    EDUCATION         EXPERIMENTATION       AI
       │                  │                  │
       ▼                  ▼                  ▼
   Curriculum        Quantum Lab          AI Tutor
       │                  │                  │
       └──────────────────┼──────────────────┘
                          ▼
                    PERSONALIZATION
                          │
                          ▼
                    LEARNING ANALYTICS
```

Instead of requiring learners to switch between several disconnected tools, QuantumLearn AI aims to provide an integrated environment.

---

# Educational Example

Consider a learner studying **quantum superposition**.

### Conventional Approach

```text
Read textbook
     ↓
Watch lecture
     ↓
Try to understand equation
     ↓
Solve questions
```

### QuantumLearn AI Approach

```text
Read Superposition Lesson
          ↓
Visual Explanation
          ↓
Interact with Qubit
          ↓
Apply H Gate
          ↓
Run Measurement
          ↓
Observe Histogram
          ↓
Ask AI Tutor
          ↓
Practice Questions
          ↓
Performance Analysis
          ↓
Recommended Next Topic
```

This turns a theoretical concept into an interactive learning experience.

---

# Design Philosophy

QuantumLearn AI is built around several principles.

## 1. Learn by Doing

Users should be able to interact with quantum concepts instead of only reading about them.

## 2. Visualize Abstract Concepts

Quantum states, measurements, circuits, and probabilities should be represented visually whenever possible.

## 3. Personalize Learning

The platform should understand individual learner progress and weaknesses.

## 4. Connect Theory With Practice

Every major concept should eventually connect to an interactive example or experiment.

## 5. Keep AI Integrated

AI should be available throughout the learning journey rather than isolated inside a chatbot page.

## 6. Build for Progressive Complexity

Users should be able to move from beginner concepts to advanced algorithms without losing the learning path.

---

# Learning Intelligence Model

The long-term learning model can be represented as:

```text
                   USER
                    │
                    ▼
             PLATFORM ACTIVITY
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
      LEARN      PRACTICE      LAB
        │           │           │
        └───────────┼───────────┘
                    ▼
                USER DATA
                    │
                    ▼
             LEARNING PROFILE
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
      Skills     Weaknesses   Progress
        │           │           │
        └───────────┼───────────┘
                    ▼
                AI ANALYSIS
                    │
                    ▼
             RECOMMENDATION
                    │
                    ▼
             NEXT BEST LESSON
                    │
                    ▼
                  LEARN
```

This creates a continuously improving learning loop.

---

# Product Architecture Philosophy

QuantumLearn AI is designed as a modular platform.

```text
                 QUANTUMLEARN AI
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
   EXPERIENCE        INTELLIGENCE      DATA
       │                │                │
       ▼                ▼                ▼
    Next.js          Gemini AI        Supabase
       │                │                │
       └────────────────┼────────────────┘
                        │
                        ▼
                  QUANTUM ENGINE
                        │
                        ▼
                  QUANTUM LAB
```

This separation allows the platform to evolve without requiring the entire application to be rewritten.

---

# Prototype Philosophy

QuantumLearn AI is currently developed as a prototype intended to demonstrate the complete concept of an AI-powered quantum education ecosystem.

The prototype focuses on proving the integration of:

* Modern web technology
* AI
* Quantum simulation
* Educational content
* Authentication
* Persistent data
* Analytics
* Personalized learning

The architecture is intentionally designed so that individual modules can be expanded independently.

---

# Long-Term Vision

The ultimate goal is to evolve QuantumLearn AI into a platform where a learner can complete an entire Quantum Computing journey without needing to constantly switch between separate applications.

A future learner could:

```text
Create Account
      ↓
Take Skill Assessment
      ↓
Receive Personalized Path
      ↓
Learn Quantum Fundamentals
      ↓
Interact with Concepts
      ↓
Build Circuits
      ↓
Run Experiments
      ↓
Practice Algorithms
      ↓
Receive AI Feedback
      ↓
Study Weak Areas
      ↓
Implement Quantum Algorithms
      ↓
Run Advanced Experiments
      ↓
Work With Real Quantum Hardware
      ↓
Explore Research Topics
```

---

# Contributing

Contributions are welcome as QuantumLearn AI evolves.

A typical contribution workflow is:

```text
Fork / Clone
     ↓
Create Feature Branch
     ↓
Implement Feature
     ↓
Test
     ↓
Commit
     ↓
Push
     ↓
Pull Request
```

Before contributing:

1. Understand the existing architecture.
2. Avoid modifying unrelated modules.
3. Test changes locally.
4. Do not commit secrets.
5. Keep feature branches focused.
6. Document significant architectural changes.

---

# Issues & Feature Requests

If you discover a bug or have an idea for improving QuantumLearn AI, create an issue describing:

### Bug

* What happened?
* What was expected?
* Steps to reproduce.
* Relevant browser/device information.
* Console or server errors if applicable.

### Feature Request

* Problem being solved.
* Proposed solution.
* Expected user experience.
* Possible implementation considerations.

---

# License

This project is currently released under the **MIT License**.

You may adapt this section if the repository uses a different license.

```text
MIT License

Copyright (c) 2026 QuantumLearn AI

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files, to deal in the Software
without restriction, including without limitation the rights to use, copy,
modify, merge, publish, distribute, sublicense, and/or sell copies of the
Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

# Acknowledgements

QuantumLearn AI is built using and inspired by the broader open-source and research ecosystem surrounding:

* Quantum Computing
* Quantum Information
* Artificial Intelligence
* Machine Learning
* Interactive Education
* Web Technologies
* Quantum Circuit Simulation

Special appreciation to the developers and researchers contributing to the open-source quantum-computing ecosystem.

---

# Author

## Nikhil Raj

**QuantumLearn AI — AI-Based Interactive Quantum Algorithm Learning Platform**

Built with:

```text
Next.js
TypeScript
React
Tailwind CSS
Supabase
Google Gemini
Quantum Computing
AI
```

---

#  Project

If you find QuantumLearn AI interesting, consider:

*  Starring the repository
*  Forking the project
*  Reporting issues
*  Suggesting improvements
*  Contributing to development

---

# QuantumLearn AI

### Learn Quantum Computing. Build Circuits. Experiment. Practice. Understand.

```text
                    ┌──────────────────────┐
                    │    QUANTUMLEARN AI   │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
          LEARN           EXPERIMENT          ASK AI
             │                 │                 │
             └─────────────────┼─────────────────┘
                               ▼
                            ANALYZE
                               │
                               ▼
                          PERSONALIZE
                               │
                               ▼
                            IMPROVE
```

> **QuantumLearn AI is an ongoing effort to make Quantum Computing education more interactive, intelligent, practical, and accessible.**

---
