# Rently – Property Rental Platform

Rently is a property rental web application inspired by platforms like Airbnb. It allows users to explore property listings, view property details, manage listings and make bookings through a web-based interface.

The project focuses on building a full-stack rental platform with user authentication, property management, booking functionality and reviews.

## Features

- **User Authentication:** User registration, login and session-based authentication.
- **Property Listings:** Browse available properties and view individual listing details.
- **Listing Management:** Create and edit property listings.
- **Booking Management:** Make bookings and view booking details.
- **Reviews:** Add reviews and ratings for property listings.
- **Responsive Interface:** Web pages styled for a user-friendly browsing experience.

## Tech Stack

| Category | Technologies |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB |
| Templating | EJS |
| Frontend | HTML, CSS, JavaScript |
| Authentication | Custom signed session cookies and password hashing |
| Validation | Joi |
| Version Control | Git and GitHub |

## Project Structure

```text
MAJOR-PROJECT/
│
├── Middlewares/       # Middleware examples and error handling
├── classroom/         # Additional Node.js practice modules
├── init/              # Database initialization and sample data
├── models/            # MongoDB models
├── public/            # Static CSS and JavaScript files
├── routes/            # Application routes
├── utils/             # Utility functions and authentication helpers
├── views/             # EJS templates
├── app.js             # Main application entry point
├── schema.js          # Joi validation schemas
├── package.json       # Project dependencies and scripts
└── .gitignore         # Files excluded from Git
```

## Getting Started

Follow these instructions to run Rently on your local machine.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- [MongoDB](https://www.mongodb.com/)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/diyamartin-04/Rently.git
```

2. Navigate to the project directory:

```bash
cd Rently
```

3. Install the dependencies:

```bash
npm install
```

### Database Configuration

Ensure that your local MongoDB server is running.

The current application configuration connects to:

```text
mongodb://127.0.0.1:27017/wanderlust
```

### Run the Application

Start the application using:

```bash
npm start
```

Open your browser and visit:

```text
http://localhost:8080
```

## Future Enhancements

- Integrate online payment functionality.
- Add advanced property search and filtering.
- Improve booking and availability management.
- Deploy the application to a cloud hosting platform.

## Author

Developed as an individual full-stack development project.

**GitHub:** [diyamartin-04](https://github.com/diyamartin-04)

---

If you find this project interesting, feel free to explore the repository!
