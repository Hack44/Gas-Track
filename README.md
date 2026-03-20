# Gas-Track
LPG Gas Tracking System

A full-stack web application for LPG cylinder booking, tracking, and management. The system features Customer, Distributor, and Admin dashboards, allowing seamless booking and order management.

⸻

Features • Customer can book cylinders, select size & quantity, and track orders. • Customer dashboard shows booking history with status, quantity, and details. • Admin dashboard (optional) for managing users and orders. • Distributor dashboard for order assignment and tracking. • Modern, responsive UI built with React. • Backend powered by Spring Boot with MySQL database.

⸻

Tech Stack • Frontend: React js CSS • Backend: Spring Boot • Database: MySQL • Version Control: Git, GitHub

⸻

Project Structure

Frontend (lpg-frontend

lpg-frontend/ ├─ src/ │ ├─ pages/ # Page components │ │ ├─ BookingPage.js │ │ ├─ CustomerDashboard.js │ │ ├─ AdminDashboard.js │ │ ├─ DistributorDashboard.js │ │ ├─ Login.js │ │ └─ Register.js │ ├─ services/api.js │ └─ App.js ├─ public/ ├─ package.json └─ README.md

Backend (lpg-backend)

lpg-backend/

├─ src/main/java/com/example/lpgsystem/ │ ├─ controller/ # API controllers │ │ └─ bookingController.java │ ├─ model/ # JPA entities │ │ └─ Booking.java │ ├─ repository/ # Spring Data repositories │ └─ LpgsystemApplication.java ├─ src/main/resources/ │ └─ application.properties ├─ pom.xml └─ README.md

Usage • Customer: Register/login → Book a cylinder → Track orders in dashboard. • Admin/Distributor: Manage orders and view status (if implemented). • Booking form includes cylinder size, quantity, name, and address.

License

This project is open-source and free to use with credit.
