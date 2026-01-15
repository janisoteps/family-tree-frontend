# Family Tree Frontend

A modern, interactive family tree visualization application built with React, TypeScript, and Vite. This frontend application provides a graphical interface for viewing and managing family relationships, including people, unions (marriages/partnerships), and parent-child relationships.

## Features

- **Interactive Family Tree Visualization**: Visualize family relationships using a graph-based layout powered by React Flow
- **Person Management**: Add and view detailed information about family members, including:
  - Personal information (name, birth/death dates, gender)
  - Contact information (email, phone, address)
  - Additional details (occupation, notes, photos)
- **Union Management**: Create and manage unions (marriages, partnerships, civil unions) between people with:
  - Union types and status tracking
  - Date and location information
  - Status management (ongoing, divorced, widowed, etc.)
- **Parent-Child Relationships**: Define and visualize parent-child relationships with support for:
  - Biological, adoptive, step, and foster parent types
- **Automatic Layout**: Uses Dagre for automatic graph layout and positioning
- **Modern UI**: Clean interface with modals, sidebar navigation, and responsive design

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Flow (@xyflow/react)** - Interactive graph visualization
- **Dagre (@dagrejs/dagre)** - Graph layout algorithm

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the port Vite assigns).

### Building for Production

Build the application:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── FamilyTree/        # Main family tree visualization components
│   ├── forms/             # Form components for creating entities
│   └── ui/                # Reusable UI components (Modal, Sidebar)
├── services/              # API service layer
├── types/                 # TypeScript type definitions
└── App.tsx               # Main application component
```

## API Integration

This frontend connects to a backend API for data persistence. Configure the API endpoint in `src/services/apiConfig.ts`.

The application supports:
- Fetching the complete family tree graph
- Creating new persons
- Creating unions between people
- Creating parent-child relationships

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## License

[Add your license here]
