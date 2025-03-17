# NeoPay - Fleet Management Application

NeoPay is a comprehensive fleet management application designed to help fleet managers track drivers, manage payments, process receipts, and handle expenses efficiently.

## Features

- **Authentication**: Secure login and registration with Supabase Auth
- **Dashboard**: Overview of payments, drivers, and expenses
- **Driver Management**: Add, edit, and track drivers
- **Pay Statement Generator**: Generate pay statements with AI assistance
- **Receipt Upload**: Upload and process receipts with AI data extraction
- **Settings**: Configure payment preferences and AI settings

## Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **AI Integration**: For receipt processing and pay statement generation

## Project Structure

```
neopay/
├── public/                  # Static assets
├── server/                  # Backend server
│   ├── src/                 # Server source code
│   │   ├── index.js         # Server entry point
│   │   └── routes/          # API routes
│   │       ├── drivers.js   # Driver management endpoints
│   │       ├── expenses.js  # Expense management endpoints
│   │       ├── payments.js  # Payment management endpoints
│   │       └── receipts.js  # Receipt management endpoints
│   ├── .env                 # Environment variables
│   └── package.json         # Server dependencies
├── src/                     # Frontend source code
│   ├── app/                 # Next.js app directory
│   │   ├── dashboard/       # Dashboard page
│   │   ├── drivers/         # Drivers management page
│   │   ├── login/           # Login page
│   │   ├── pay-statements/  # Pay statements page
│   │   ├── receipts/        # Receipts page
│   │   ├── register/        # Registration page
│   │   ├── settings/        # Settings page
│   │   ├── globals.css      # Global styles
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── components/          # Reusable components
│   ├── contexts/            # React contexts
│   └── utils/               # Utility functions
├── supabase/                # Supabase configuration
│   └── schema.sql           # Database schema
├── .env.local               # Frontend environment variables
├── package.json             # Frontend dependencies
├── tailwind.config.js       # Tailwind CSS configuration
├── postcss.config.js        # PostCSS configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Supabase account

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/neopay.git
cd neopay
```

### 2. Install dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### 3. Set up Supabase

1. Create a new Supabase project at [https://supabase.com](https://supabase.com)
2. Get your Supabase URL and anon key from the project settings
3. Run the SQL script in `supabase/schema.sql` in the Supabase SQL editor to set up the database schema

### 4. Configure environment variables

Example environment files are provided in the repository:

- Copy `.env.local.example` to `.env.local` for the frontend:
  ```bash
  cp .env.local.example .env.local
  ```

- Copy `server/.env.example` to `server/.env` for the backend:
  ```bash
  cp server/.env.example server/.env
  ```

Then update both files with your Supabase credentials and other configuration values.

### 5. Run the application

You can start both the frontend and backend servers simultaneously:

```bash
# Start both frontend and backend
npm run dev:all
```

Or run them separately:

```bash
# Start the backend server
cd server
npm run dev

# In a new terminal, start the frontend
cd ..
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000), and the API will be running at [http://localhost:5000](http://localhost:5000)

## Usage

1. Register a new account or log in with existing credentials
2. Navigate through the application using the sidebar menu
3. Add drivers to your fleet
4. Generate pay statements by entering trip and expense data
5. Upload receipts for AI processing
6. Configure settings according to your preferences

## AI Features

The application includes AI-powered features for:

1. **Receipt Analysis**: Automatically extract vendor, date, amount, and items from uploaded receipts
2. **Pay Statement Generation**: Generate detailed pay statements based on trip and expense data

## Future Enhancements

- Mobile application for drivers
- Real-time tracking and notifications
- Advanced reporting and analytics
- Integration with accounting software
- Multi-language support

## License

MIT
