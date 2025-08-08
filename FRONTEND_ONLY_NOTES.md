# Frontend-Only Build Dependencies
# These server-side dependencies are not needed for Azure Static Web Apps
# They should be moved to Azure Functions if server-side functionality is needed

# Server-side dependencies to exclude from frontend build:
# express
# archiver
# marked
# puppeteer
# handlebars
# fs (built-in Node.js, not needed in browser)

# For Azure Static Web Apps, consider:
# 1. Move API routes to Azure Functions (/api folder)
# 2. Use Azure Static Web Apps API instead of Express
# 3. Move PDF generation to Azure Functions with Puppeteer
# 4. Use client-side alternatives where possible
