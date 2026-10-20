# SAHAY — Smart Emergency Response & Assistance

A full-stack emergency response coordination platform designed to connect citizens, emergency responders, hospitals, and authorities through a centralized digital system.

**Repository:** [Sahay-Emergency-Response](https://github.com/Muskan99113-cell/Sahay-Emergency-Response)

---

## 1. Project Overview

SAHAY is a web-based emergency management application that aims to improve emergency coordination, incident visibility, and communication between different stakeholders.

The platform provides role-specific dashboards, incident monitoring, priority indicators, geographic visualization, and a shared backend API.

The project follows a client-server architecture, with a React frontend and a Python FastAPI backend.

## 2. Problem Statement

Emergency response operations can face challenges such as fragmented communication, delayed coordination, limited incident visibility, and difficulty prioritizing multiple emergencies.

SAHAY aims to address these challenges by providing a centralized platform where relevant stakeholders can access emergency-related information and their respective operational interfaces.

## 3. Project Objectives

- Provide a centralized emergency monitoring platform.

- Support separate interfaces for different user roles.

- Display incident severity, status, and priority information.

- Visualize incident locations on an interactive map.

- Support hospital and responder coordination workflows.

- Provide authentication-related functionality.

- Maintain a modular and maintainable application architecture.

- Establish a foundation for future intelligent emergency dispatch.

## 4. Key Features

### 4.1 Authentication

- Registration and login interface.

- Backend authentication-related functionality.

- Role-based dashboard navigation.

- Separate interfaces for different user categories.

The exact access permissions depend on the backend authorization implemented for each endpoint.

### 4.2 Authority Dashboard

The Authority Dashboard provides a centralized view of emergency operations.

Features include:

- Total incident statistics.

- Active, critical, and high-priority incident counts.

- Assigned responder and hospital coordination indicators.

- Average priority information.

- Interactive incident map.

- Incident status and severity indicators.

- Filters for critical incidents, high-priority incidents, responder assignments, and hospital coordination.

- Manual refresh and periodic dashboard updates.

### 4.3 Hospital Dashboard

The Hospital Dashboard provides a dedicated interface for hospital-related emergency coordination.

Its available operations depend on the backend endpoints and workflows implemented in the application.

### 4.4 Responder Dashboard

The Responder Dashboard provides a separate interface for responder-related operations and emergency response workflows.

### 4.5 Administrator Dashboard

The Administrator Dashboard provides an interface for administrative operations and platform management, subject to the permissions implemented by the backend.

### 4.6 Interactive Map

The application uses React Leaflet and Leaflet for geographic visualization.

The Authority Dashboard includes a map component designed to display available emergency incident locations.

### 4.7 User Interface

- React-based component architecture.

- Tailwind CSS and custom CSS styling.

- Reusable dashboard components.

- Responsive layouts.

- Centralized frontend API configuration.

## 5. User Roles

| Role | Purpose |

|---|---|

| Citizen | Access citizen-facing application features |

| Authority | Monitor incidents and oversee emergency coordination |

| Hospital | Access hospital-related coordination features |

| Responder | Access responder-related workflows |

| Administrator | Access administrative features |

Backend authorization should ensure that each role can access only the operations permitted for that role.

## Account Registration & Staff Access
Citizen Account
Citizens can create their own accounts through the Sign Up / Register option on the SAHAY website.
Hospital, Responder, Authority & Admin Accounts
Hospital, Responder, Authority, and Admin accounts cannot be created through public registration. People interested in these roles should contact the SAHAY team and request access. Accounts should be created only by an authorized administrator.
Test Account Reference
The following are the requested test credentials. These accounts must exist in the configured database, and the password must have been set to the value below for login to work.
Role	Test login email	Test password
Citizen	citizen1@gmail.com	11111111
Responder	responder1@gmail.com	11111111
Hospital	hospital1@gmail.com	11111111
Admin	admin1@gmail.com	11111111
Authority	authority1@gmail.com	11111111


Security warning: This repository is public. Do not commit or push real/shared passwords to a public GitHub repository. Keep this password table in a local/private README only, or change the test accounts to unique temporary passwords and share them privately with authorized testers. These credentials do not confirm that the accounts have already been created.

## 6. System Architecture

SAHAY follows a client-server architecture.

```text

                 USERS

                   |

                   v

             REACT FRONTEND

                   |

                   v

          SHARED API CONFIGURATION

                   |

                   v

             FASTAPI BACKEND

                   |

          +--------+--------+

          |                 |

          v                 v

    AUTHENTICATION     BUSINESS LOGIC

          |                 |

          +--------+--------+

                   |

                   v

             DATABASE LAYER

                   |

                   v

       APPLICATION DATA AND RECORDS

```

### Frontend

The frontend renders the user interface, manages dashboard interactions, displays incident information, and communicates with backend APIs.

### Backend

The backend processes HTTP requests, validates input, executes application logic, and interacts with the database.

### Database

The database layer provides persistence for application data according to the configured database engine and implemented models.

### API Layer

The frontend uses a shared API helper to centralize backend URL configuration and HTTP requests.

## 7. Technology Stack

| Technology | Purpose |

|---|---|

| React | Frontend framework |

| JavaScript and JSX | Frontend programming |

| Vite | Development server and production build |

| Tailwind CSS | Utility-based styling |

| CSS | Custom application styling |

| React Leaflet | React integration for maps |

| Leaflet | Interactive maps |

| Python | Backend programming |

| FastAPI | Backend API framework |

| Git | Version control |

| GitHub | Source code hosting |

The exact database engine and additional backend dependencies should be confirmed from the backend configuration and dependency files.

## 8. Project Structure

```text

Sahay-Emergency-Response/

|

|-- frontend/

|   |-- src/

|   |   |-- components/

|   |   |   |-- AuthorityDashboard.jsx

|   |   |   |-- HospitalDashboard.jsx

|   |   |   |-- ResponderDashboard.jsx

|   |   |

|   |   |-- lib/

|   |   |   |-- api.js

|   |   |

|   |   |-- App.jsx

|   |   |-- AuthPage.jsx

|   |   |-- AdminDashboard.jsx

|   |   |-- AuthorityDashboard.jsx

|   |   |-- HospitalDashboard.jsx

|   |   |-- App.css

|   |   |-- index.css

|   |   |-- main.jsx

|   |

|   |-- package.json

|

|-- backend/

|   |-- app/

|   |   |-- models/

|   |   |-- routers/

|   |   |-- schemas/

|   |   |-- database.py

|   |   |-- init_db.py

|   |   |-- main.py

|   |   |-- security.py

|   |

|   |-- scripts/

|

|-- README.md

```

This is a high-level representation of important project files. Other modules, configuration files, and supporting components may also exist in the repository.

## 9. Local Installation and Setup

### Prerequisites

Install the following:

- Git

- Python compatible with the backend dependencies

- Node.js and npm

- Visual Studio Code or another code editor

### Step 1: Clone the Repository

```bash

git clone https://github.com/Muskan99113-cell/Sahay-Emergency-Response.git

cd Sahay-Emergency-Response

```

### Step 2: Configure the Backend

Open a terminal in the repository root.

For Windows PowerShell:

```powershell

cd backend

python -m venv env

.\env\Scripts\Activate.ps1

python -m pip install --upgrade pip

```

If the backend contains a `requirements.txt` file, install its dependencies:

```powershell

pip install -r requirements.txt

```

If the project uses a different dependency file, follow the instructions for that file.

Configure the database and required environment variables according to the backend configuration.

Start the backend from the `backend` directory:

```powershell

uvicorn app.main:app --reload

```

The default development address is:

`http://127.0.0.1:8000`

### Step 3: Configure the Frontend

Open a second terminal:

```powershell

cd frontend

npm install

```

Create a `.env.local` file inside the `frontend` directory:

```env

VITE_API_BASE_URL=http://127.0.0.1:8000

```

Start the frontend development server:

```powershell

npm run dev

```

Open the local URL displayed in the terminal.

### Step 4: Build the Frontend

To create the production frontend build:

```powershell

npm run build

```

The generated files are placed in the `dist` directory.

## 10. API Documentation

SAHAY uses FastAPI for its backend API.

When the backend is running locally, the following documentation endpoints are normally available:

| Endpoint | Purpose |

|---|---|

| `/docs` | Interactive Swagger UI |

| `/redoc` | ReDoc API documentation |

| `/openapi.json` | OpenAPI schema |

Local URLs:

- `http://127.0.0.1:8000/docs`

- `http://127.0.0.1:8000/redoc`

- `http://127.0.0.1:8000/openapi.json`

These addresses assume the default local server configuration.

The exact API routes, HTTP methods, request schemas, authentication requirements, and response formats should be reviewed in the backend route definitions and OpenAPI documentation.

## 11. Environment Configuration

### Frontend

| Variable | Description |

|---|---|

| `VITE_API_BASE_URL` | Base URL of the backend API |

Example local value:

```env

VITE_API_BASE_URL=http://127.0.0.1:8000

```

For production, configure this variable with the deployed backend URL.

Never store private API keys, database credentials, signing secrets, or other server-only secrets in frontend environment variables.

### Backend

Configure the variables required by the actual backend implementation, such as:

- Database connection settings.

- Authentication and signing secrets.

- Allowed frontend origins.

- Other service-specific configuration.

Keep production credentials outside the repository.

## 12. Deployment

The frontend and backend may need to be deployed as separate services.

### Frontend Deployment

1. Connect the GitHub repository to the hosting platform.

2. Set the frontend root directory to `frontend`, if required.

3. Configure the build command as `npm run build`.

4. Configure the output directory as `dist`.

5. Set `VITE_API_BASE_URL` to the deployed backend URL.

6. Deploy and test the application.

### Backend Deployment

1. Select a hosting service that supports Python ASGI applications.

2. Install the required dependencies.

3. Configure the production database.

4. Set the required environment variables.

5. Configure CORS for the deployed frontend origin.

6. Start the FastAPI application using an appropriate ASGI server.

7. Verify authentication, database connectivity, and API responses.

A successful frontend build does not guarantee that the backend or database is deployed correctly.

## 13. Security Considerations

Security is particularly important for applications that handle emergency and location-related information.

Recommended safeguards include:

- Secure password hashing.

- Server-side authentication and authorization.

- Role-based permission checks for protected endpoints.

- Input validation.

- HTTPS in production.

- Proper CORS configuration.

- Secret management through environment variables.

- Appropriate access controls for sensitive data.

- Rate limiting for sensitive operations.

- Secure logging and audit trails.

- Database backup and recovery procedures.

Frontend navigation restrictions alone do not protect backend endpoints. Permissions must be enforced on the server.

## 14. Testing and Validation

### Frontend Build Check

Run from the `frontend` directory:

```powershell

npm run build

```

### Backend Import Check

Run from the `backend` directory on Windows:

```powershell

.\env\Scripts\python.exe -c "from app.main import app; print('BACKEND_IMPORT_OK')"

```

### Recommended Functional Tests

- Test registration and login.

- Verify invalid login attempts are rejected.

- Test role-based dashboard navigation.

- Verify incident retrieval and creation through supported APIs.

- Check incident severity and status displays.

- Test incident filters.

- Verify map rendering when location data is available.

- Test hospital and responder workflows.

- Verify unauthorized requests are rejected.

- Test the deployed frontend and backend together.

Build and import checks are initial validations, not substitutes for functional and security testing.

## 15. Current Limitations

SAHAY is under active development. The availability and reliability of each feature depend on its current frontend and backend implementation.

Areas requiring further verification include:

- Complete role-based authorization.

- Production database configuration.

- End-to-end incident creation and management.

- Automated responder dispatch.

- Hospital availability and acceptance workflows.

- Notification and escalation mechanisms.

- Production monitoring and audit trails.

- End-to-end deployment validation.

The presence of a dashboard does not necessarily mean every related backend workflow is fully implemented.

## 16. Future Enhancements

Potential future improvements include:

- Intelligent emergency classification.

- Automated incident priority assessment.

- Location-based responder matching.

- Dispatch acceptance and escalation workflows.

- Hospital capacity and availability management.

- Real-time notifications.

- Incident history and audit logs.

- Route optimization.

- Response-time analytics.

- Automated testing and continuous integration.

- Improved monitoring, backup, and recovery.

- Multilingual and accessibility improvements.

These are proposed enhancements and should not be interpreted as features already implemented.

## 17. Contributing

Contributions and suggestions are welcome.

1. Fork the repository.

2. Create a feature branch.

3. Implement the change.

4. Test the frontend and backend.

5. Commit your changes with a descriptive message.

6. Open a pull request explaining the changes and validation performed.

Do not commit private credentials, environment files, passwords, or sensitive personal information.

## 18. License

A license has not yet been specified in this README. Add an appropriate `LICENSE` file before distributing the project under specific licensing terms.

---

## About SAHAY

SAHAY — Smart Emergency Response & Assistance — aims to improve emergency coordination through a centralized platform for citizens, responders, hospitals, and authorities.

**Project Goal:** Better coordination, clearer information, and more effective emergency response.

