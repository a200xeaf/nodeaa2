# Nodeaa: Modular Browser-Based Digital Audio Workstation

Nodeaa is an innovative browser-based Digital Audio Workstation (DAW) built using React, TypeScript, and Vite. Inspired by tools like Pure Data and MaxMSP, Nodeaa enables real-time modular sound processing and node-based audio routing directly in your browser. With features like context-aware documentation, advanced audio routing, and versatile UI components. Nodeaa is designed for both beginners and audio professionals.

[nodeaa.pages.dev](nodeaa.pages.dev)

---

## Features

- **Real-Time Audio Processing**: Seamless, low-latency sound design directly in your browser.
- **Node-Based Routing**: Create complex audio workflows with intuitive drag-and-drop functionality.
- **Developer Tools**: Build custom nodes with modular UI components and React hooks.
- **Context-Aware Documentation**: In-app tooltips for parameters and devices.

Note: Data-based nodes are currently disabled for refactoring however a working copy still exists in the code and can be tested in the [rnbotestzone repo here](https://github.com/a200xeaf/rnbotestzone) or live on [https://nodeaatestzone.pages.dev/data](https://nodeaatestzone.pages.dev/data)

---

## Getting Started

### Prerequisites

Make sure you have Node.js (>=16.0.0) and npm (>=7.0.0) installed.

### Installation

Clone the repository and install the dependencies:

```bash
# Clone the repository
git clone https://github.com/a200xeaf/nodeaa2.git

# Navigate to the project directory
cd nodeaa2

# Install dependencies
npm install
```

### Development Server

Start the development server:

```bash
npm run dev
```

The app will be available at [http://localhost:5173](http://localhost:5173).

### Build for Production

Create an optimized production build:

```bash
npm run build
```

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

---

## Project Structure

- **src/**: Contains the main application source code.
- **public/**: Static assets like icons and images.
- **LATEXSOURCE/**: The accompanying LaTeX document for this project.
- **SURVEYRESULTS/**: Folder containing raw survey data and summaries.

---

## License

This project is licensed under the GNU Affero General Public License (AGPL) v3. See the `LICENSE` file for more details.

---

## Contact

For questions or feedback, feel free to open an issue or contact the maintainer at [a200xeaf@protonmail.com](mailto:a200xeaf@protonmail.com).

---

Enjoy creating with Nodeaa! 🎵
