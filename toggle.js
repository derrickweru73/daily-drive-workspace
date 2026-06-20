// toggle.js
import { AuthManager } from './auth.js';

function renderToggleBarUI() {
  const toggleBar = document.getElementById('quickUserToggleBar');
  if (!toggleBar) return;

  try {
    const currentUser = AuthManager.getCurrentUser();
    
    // 1. Safety Check: If no user session is active, hide the bar completely
    if (!currentUser) {
      toggleBar.style.setProperty('display', 'none', 'important');
      return;
    }
    
    // 2. Clear out any leftover elements from previous render attempts
    toggleBar.innerHTML = '';

    // 3. SECURE ROLE VALIDATION LOOP: Check the string text property directly
    if (String(currentUser.role).toLowerCase() === 'employee') {
      
      // EMPLOYEE VIEW LAYOUT: Hide the dropdown selection entirely and draw the Return Button
      toggleBar.style.background = '#34495e'; 
      toggleBar.style.display = 'flex';
      toggleBar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">👤</span>
          <strong>Employee Workspace View</strong>
          <span style="color: #bdc3c7; font-size: 13px;">(Reviewing isolated tasks)</span>
        </div>
        <button id="devReturnToAdminBtn" style="background: #e74c3c; color: white; border: none; padding: 6px 14px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 13px; font-family: Arial, sans-serif; box-shadow: 0 1px 3px rgba(0,0,0,0.2);">
          ⬅️ Return to Manager View
        </button>
      `;

      // Set up click action to force-switch back to admin root
      document.getElementById('devReturnToAdminBtn').addEventListener('click', () => {
        AuthManager.logout();
        AuthManager.login('admin', 'password123');
        window.location.reload();
      });

    } else {
      
      // MANAGER VIEW LAYOUT: Show full interactive developer dropdown list selection matrix
      toggleBar.style.background = '#2c3e50';
      toggleBar.style.display = 'flex';
      toggleBar.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 16px;">⚡</span>
          <strong>Developer Fast Switch:</strong>
          <span style="color: #bdc3c7;">Change roles instantly to test employee screen filters.</span>
        </div>
        <div>
          <label for="devUserSelect" style="margin-right: 8px; font-weight: bold; color: #f1c40f;">Active Profile:</label>
          <select id="devUserSelect" style="padding: 6px 12px; background: #fff; border: 1px solid #ccc; border-radius: 4px; font-size: 13px; cursor: pointer; color: #333; font-weight: bold; min-width: 180px;">
          </select>
        </div>
      `;

      // Re-populate choice options dropdown dynamically
      const devSelect = document.getElementById('devUserSelect');
      const database = AuthManager.getUsersDatabase();
      
      devSelect.innerHTML = database.map(user => {
        const isCurrent = currentUser.username === user.username ? 'selected' : '';
        return `<option value="${user.username}" data-pass="${user.password}" ${isCurrent}>${user.name} (${user.role})</option>`;
      }).join('');

      // Attach dropdown selection change listener event
      devSelect.addEventListener('change', (e) => {
        const selectedUsername = e.target.value;
        if (!selectedUsername) return;

        const selectedOption = devSelect.options[devSelect.selectedIndex];
        const passwordKey = selectedOption.getAttribute('data-pass');

        AuthManager.logout();
        AuthManager.login(selectedUsername, passwordKey);
        window.location.reload();
      });
    }
  } catch (err) {
    console.error("Toggle panel render caught safe exception:", err);
  }
}

// TIMING FIX: Observe changes to the workspace screen visibility to ensure sync
const workspaceScreen = document.getElementById('workspaceScreen');
if (workspaceScreen) {
  const observer = new MutationObserver(() => {
    // Re-run rendering layout updates whenever script.js unhides the screen
    if (!workspaceScreen.classList.contains('hidden')) {
      renderToggleBarUI();
    }
  });
  observer.observe(workspaceScreen, { attributes: true, attributeFilter: ['class'] });
}

// Initial fallback run
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderToggleBarUI);
} else {
  renderToggleBarUI();
}