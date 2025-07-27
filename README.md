# Raseed - AI Powered Receipt Management App

![Raseed Logo](https://img.icons8.com/color/96/000000/receipt.png)

## Overview

Raseed is an AI-powered receipt management application that allows users to upload, process, and analyze receipts. The app features spending insights, Google Wallet integration, and an AI assistant for answering questions about spending patterns.

## Features

- **Google Authentication**: Secure login with Google
- **Receipt Upload**: Upload receipts as images or PDFs
- **OCR Processing**: AI-powered text extraction from receipts
- **Spending Insights**: Visualize spending patterns with charts
- **Google Wallet Integration**: Add receipts to Google Wallet
- **AI Assistant**: Ask questions about your spending habits
- **Anomaly Detection**: Identify unusual spending patterns
- **Data Visualization**: Chart.js integration for spending trends

## Prerequisites

- Node.js v20.14.0 (recommended)
- npm v10.7.0+
- can use nvm use v20 as node version manager (recommended)

- Git
## Installation

### 1. Clone the Repository

git clone https://github.com/vaibhavc95/raseed-app.git
cd raseed-app

## Install Quasar CLI
npm install -g @quasar/cli

## Install Dependencies
npm install

## Start the Development Server
quasar dev

## Build for Production if required
quasar build




src/
├── App.vue                 # Main application component
├── assets/                 # Static assets
├── boot/                   # App initialization code
│   ├── axios.js            # Regular axios setup
│   └── secureAxios.js      # Secure axios with auth token
├── components/             # Reusable Vue components
│   ├── EssentialLink.vue   # Link component
│   └── ReceiptEditor.vue   # Receipt editor component
├── css/                    # Global CSS
├── layouts/                # Layout components
│   └── MainLayout.vue      # Main layout with navigation
├── pages/                  # Application pages
│   ├── AssistantPage.vue   # AI assistant page
│   ├── CreateRaseedPage.vue # Receipt upload page
│   ├── ErrorNotFound.vue   # 404 page
│   ├── HomePage.vue        # Landing page
│   ├── IndexPage.vue       # Index page
│   ├── InsightsPage.vue    # Spending insights page
│   └── LoginPage.vue       # Login page
├── router/                 # Vue Router configuration
└── stores/                 # State management
    └── userStore.js        # User authentication store



## Dependencies
The project uses the following major dependencies:

- Quasar Framework: v2.16.0 - UI framework and build tools
- Vue.js: v3.4.18 - Frontend framework
- Vue Router: v4.0.12 - Routing
- Axios: v1.2.1 - HTTP client
- Chart.js: v4.5.0 - Charting library
- Pinia: v3.0.1 - State management
- UUID: v11.1.0 - Generate unique IDs
- Vue3 Google Login: v2.0.33 - Google authentication


## Author
- The Radix Squad - Contact Vaibhav Chauhan for any queries email: vamb.c95@gmail.com

## License
- This project is licensed under the MIT License - see the LICENSE file for details.


