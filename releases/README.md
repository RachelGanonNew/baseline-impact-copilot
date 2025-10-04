# Building the VSIX File

To create the VSIX package for the Baseline Impact Copilot VSCode extension, follow these steps:

1. **Install Dependencies**
   ```bash
   cd packages/vscode
   npm install
   ```

2. **Install VS Code Extension Manager (vsce)**
   ```bash
   npm install -g @vscode/vsce
   ```

3. **Package the Extension**
   ```bash
   vsce package
   ```
   This will create a `.vsix` file in the `packages/vscode` directory.

4. **Install the Extension**
   - Open VS Code
   - Go to Extensions view (Ctrl+Shift+X)
   - Click on "..." and select "Install from VSIX..."
   - Navigate to and select the generated `.vsix` file

## Requirements
- Node.js (v14 or later)
- npm (v6 or later)
- VS Code (latest version recommended)
