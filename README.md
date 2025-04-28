# Facility Profiling Frontend

This is the frontend application for the Facility Profiling project. It's built with React and connects to a FastAPI backend.

## Features

- User authentication (login/register)
- View, create, edit, and delete inspection records
- Responsive design using Bootstrap

## Project Setup

All files have been created in the directory structure. To finish setting up:

1. Open a command prompt in this directory (C:\Users\udhof\fastapi\forms)
2. Install dependencies:
```bash
npm install
```

3. Update the API URL in `src/api/index.js` to point to your deployed backend:
```javascript
const API = axios.create({
  baseURL: 'https://your-backend-url.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  },
});
```

4. Start the development server:
```bash
npm start
```

## Development

During development, the application will be available at http://localhost:3000

## Deployment to GitHub Pages

1. Create a new GitHub repository named `facility-profiling-frontend`
2. Push this code to the repository
3. Deploy to GitHub Pages:
```bash
npm run deploy
```

4. Configure GitHub Pages in your repository settings:
   - Go to your GitHub repository settings
   - Find the "GitHub Pages" section
   - Select the "gh-pages" branch as the source
   - Save the changes
   - Your site will be published at the URL specified in the "homepage" field in package.json

## Backend Connection

This frontend connects to the FastAPI backend API hosted on Render.com. Make sure your backend CORS settings allow requests from your GitHub Pages domain (or from localhost during development).