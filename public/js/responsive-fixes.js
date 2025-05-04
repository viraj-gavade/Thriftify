(function() {
  // Add viewport meta if missing
  if (!document.querySelector('meta[name="viewport"]')) {
    const meta = document.createElement('meta');
    meta.setAttribute('name', 'viewport');
    meta.setAttribute('content', 'width=device-width, initial-scale=1.0');
    document.head.appendChild(meta);
  }
  
  // Add global responsive styles
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
  
  // Fix any tables for mobile
  const tables = document.querySelectorAll('table');
  tables.forEach(table => {
    const wrapper = document.createElement('div');
    wrapper.style.overflowX = 'auto';
    wrapper.style.width = '100%';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
})();
