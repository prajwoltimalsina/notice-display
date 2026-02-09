# KU Notice Board Display System

A modern notice board display system for Kathmandu University with real-time updates, role-based access control, and a responsive design.

## Features

- **Admin Dashboard**: Manage notices with draft/publish functionality
- **Role-Based Access Control**: Admin and user roles with approval workflows
- **Real-Time Updates**: Socket.io integration for live updates
- **Display System**: Full-screen notice display with slideshow functionality
- **Cloud Storage**: Cloudinary integration for image/PDF uploads
- **Offline Support**: IndexedDB caching for offline viewing

## How to Work with This Code

You can edit this code in several ways:

**Use your preferred IDE**

Clone this repo and make changes locally. Push changes to update the deployed version.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deployment

Deploy this project using your preferred hosting service (Vercel, Netlify, etc.).

Set the following environment variables:
- `VITE_API_BASE_URL`: Your backend API URL
- `VITE_SUPABASE_PROJECT_ID`: Supabase project ID (if using)
- `VITE_SUPABASE_PUBLISHABLE_KEY`: Supabase public key (if using)
