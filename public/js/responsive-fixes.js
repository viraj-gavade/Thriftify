/**
 * @fileoverview Responsive enhancement script for Thriftify
 * 
 * This script automatically applies responsive design fixes to ensure
 * proper display across all device sizes. It runs immediately upon loading
 * and makes the following adjustments:
 * 
 * 1. Ensures a viewport meta tag exists
 * 2. Adds global responsive CSS rules
 * 3. Wraps tables in scrollable containers for mobile devices
 */

/**
 * Self-executing function that applies responsive design fixes
 * Runs immediately when the script is loaded
 */
(function() {
  // Ensure viewport meta tag exists for proper responsive behavior
  ensureViewportMeta();
  
  // Add global responsive styles to handle various screen sizes
  injectResponsiveStyles();
  
  // Make tables horizontally scrollable on small screens
  fixTablesForMobile();
})();

/**
 * Adds viewport meta tag if not already present in the document
 * Critical for proper mobile rendering
 */
function ensureViewportMeta() {
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
    document.head.appendChild(meta);
  }
}

/**
 * Injects global CSS rules for responsive behavior
 * Applies styling at different breakpoints (768px and 576px)
 */
function injectResponsiveStyles() {
  const responsiveStyles = `
    * { box-sizing: border-box; }
    img { max-width: 100%; height: auto; }
    input, select, textarea, button { max-width: 100%; }
    
    @media (max-width: 768px) {
      .container, .main-container, .content-container, 
      .listing-container, .category-container {
        width: 100% !important;
        max-width: 100% !important;
        padding-left: 10px !important;
        padding-right: 10px !important;
      }
      
      .row {
        flex-wrap: wrap !important;
      }
      
      h1 { font-size: 1.8rem !important; }
      h2 { font-size: 1.5rem !important; }
      h3 { font-size: 1.2rem !important; }
    }
    
    @media (max-width: 576px) {
      .col, .column, [class*="col-"] {
        width: 100% !important;
        max-width: 100% !important;
        flex: 0 0 100% !important;
      }
      
      .hidden-xs { display: none !important; }
      
      h1 { font-size: 1.5rem !important; }
      h2 { font-size: 1.3rem !important; }
      h3 { font-size: 1.1rem !important; }
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = responsiveStyles;
  document.head.appendChild(style);
}

/**
 * Makes tables responsive by wrapping them in scrollable containers
 * This prevents tables from breaking the layout on small screens
 */
function fixTablesForMobile() {
  const tables = document.querySelectorAll('table');
  tables.forEach(table => {
    const wrapper = document.createElement('div');
    wrapper.style.overflowX = 'auto';
    wrapper.style.width = '100%';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}
