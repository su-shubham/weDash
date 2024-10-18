# weDash ☁️

Monitor Weather is a comprehensive weather monitoring application designed to provide users with real-time weather updates, alerts, and visualizations.


## Getting Started

### Prerequisites

To run this application, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **Go** (v1.19 or higher)
- **Docker** and **Docker Compose**

### Installation

Follow these steps to set up the project:

1. **Clone the repository:**
    ```bash
    git clone https://github.com/su-shubham/weDash.git
    ```

2. **Set up environment variables:**
    ```bash
    cp backend/.env.example .env
    cp frontend/.env.local.example frontend/.env.local
    ```

3. **Start the development environment using Makefile:**
    ```bash
    make dev
    ```

4. **To stop services, run:**
    ```bash
    make down
    ```

5. **To clean everything, including Docker volumes and cached files, run:**
    ```bash
    make clean
    ```

6. **To view logs, use:**
    ```bash
    make logs
    ```

7. **For specific backend or frontend logs, run:**
    ```bash
    make frontend-logs  # For frontend logs
    ```
### Screenshots:

<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/f2230cb8-f78c-454e-927d-f3ae3699fdf6" width="400" /></td>
  </tr>
</table>
