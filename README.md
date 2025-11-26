
  # LibraGO

  This is a code bundle for LibraGO. The original project is available at https://www.figma.com/design/PNgNyCQgx6biznLjx9LUUV/LibraGO

  ## Getting Started

To run this project locally, follow these steps:

### Prerequisites

Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/Marseillo10/LibraGO.git
    ```
2.  **Navigate to the project directory**:
    ```bash
    cd LibraGO
    ```
3.  **Install dependencies**:
    ```bash
    npm install
    ```
### Running the Application

To start the development server:

```bash
npm run dev
```

This will start the application, usually at `http://localhost:3000` (or another port if 3000 is in use). Open your browser and navigate to that URL to view the app.

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be generated in the `dist` directory.

### Environment Variables (Optional)

This project uses environment variables for configuration.

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```
2.  Open `.env` and update the values with your own configuration (it doesn't affect the current project application).

    ```env
    VITE_API_URL=https://api.librago.com
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_KEY=your_supabase_key
    VITE_STRIPE_KEY=your_stripe_key
    ```