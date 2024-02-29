document.addEventListener('DOMContentLoaded', () => {
    const loginButton = document.getElementById('login');
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('message');
  
    loginButton.addEventListener('click', async () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
  
      try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded', // or 'application/json'
            },
            body: JSON.stringify({ email, password }),
          });
          
  
        if (response.ok) {
          const result = await response.json();
          const userId = result.userId;
  
          // Redirect to accountinfo.html with the user's ID
          window.location.href = `/accountinfo.html?id=${userId}`;
        } else {
          // Display error message
          errorMessage.innerText = 'Login attempt failed.';
        }
      } catch (error) {
        console.error('Error during login:', error);
  
        if (error instanceof TypeError && error.message.includes('NetworkError')) {
          errorMessage.innerText = 'Network error during login. Check your internet connection or server status.';
        } else {
          errorMessage.innerText = 'An error occurred during login.';
        }
      }
    });
  });
  