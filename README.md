# Green Hydrogen Dashboard

A comprehensive dashboard for managing green hydrogen transactions with role-based access control.

## Features

- **Authentication System**
  - User registration and login
  - Email/password authentication
  - Role-based access control (Buyer, Producer, Auditor)
  - Protected routes based on user roles

- **Role-Specific Dashboards**
  - **Buyer**: View and purchase hydrogen, track orders, view sustainability reports
  - **Producer**: Monitor production, manage inventory, handle orders
  - **Auditor**: View transaction history, check compliance, generate reports

## Tech Stack

- React 18
- React Router v6
- Supabase (Authentication & Database)
- Tailwind CSS
- Framer Motion (Animations)
- Recharts (Data Visualization)

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd green-hydrogen-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory with the following content:
   ```
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Set up Supabase**
   - Create a new project at [Supabase](https://supabase.com/)
   - Run the SQL migration from `supabase/migrations/20230830000000_create_initial_tables.sql` in your Supabase SQL editor
   - Enable Email/Password authentication in the Authentication > Providers section

5. **Start the development server**
   ```bash
   npm start
   ```

## Project Structure

```
src/
├── components/           # Reusable UI components
│   └── auth/            # Authentication components
├── contexts/            # React contexts
├── lib/                 # Utility functions and configurations
├── pages/               # Page components
│   ├── dashboard/       # Role-specific dashboards
│   ├── Login.js         # Login page
│   ├── SignUp.js        # Signup page
│   └── Unauthorized.js  # 403 page
└── App.js               # Main application component
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
