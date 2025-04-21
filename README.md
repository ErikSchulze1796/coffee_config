# Coffee Configuration Manager

A web application for managing coffee brewing configurations, built with React and Express.js. The application allows you to save and manage different coffee brewing parameters like grind size, water temperature, and brew time.

## Features

- Create and save coffee brewing configurations
- Track parameters like:
  - Brand and blend
  - Coffee weight
  - Grind size
  - Grind time
  - Water temperature
  - Brew time
  - Additional notes
- View and manage saved configurations
- Autocomplete suggestions for brands and blends
- Responsive design for both desktop and mobile use

## Tech Stack

- **Frontend**: React.js with Material-UI
- **Backend**: Express.js
- **Database**: SQLite
- **API**: RESTful endpoints

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- SQLite3

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd coffee_config
```

2. Install dependencies for both client and server:
```bash
# Install server dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

## Running the Application

1. Start the server:
```bash
node server.js
```

2. In a new terminal, start the client:
```bash
cd client
npm start
```

The application will be available at:
- Local: http://localhost:3000
- Network: http://[your-ip]:3000

## API Endpoints

- `GET /api/configs` - Get all coffee configurations
- `POST /api/configs` - Create a new configuration
- `DELETE /api/configs/:id` - Delete a configuration

## Project Structure

```
coffee_config/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # React components
│       └── App.js
├── server.js              # Express backend
├── coffee.db              # SQLite database
└── README.md
```

## Development

- The server runs on port 3001
- The client runs on port 3000
- The SQLite database is automatically created on first run
- CORS is configured to allow both local and network access

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
