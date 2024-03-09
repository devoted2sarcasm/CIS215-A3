document.addEventListener('DOMContentLoaded', () => {
  const loginButton = document.getElementById('login');
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('message');

  loginButton.addEventListener('click', async () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      console.log('email: ', email);
      console.log('password: ', password);
      console.log('payload: ', JSON.stringify({ email, password }));

      try {
          console.log('fetching...');
          const response = await fetch('/api/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ email, password }),
          });
          console.log('fetch complete: ', response);

          if (response.ok) {
              console.log('response ok');
              const result = await response.json();
              console.log(response.json());
              const userId = result.userId;

              // Fetch account information
              const accountInfoResponse = await fetch(`/api/accountinfo/${userId}`);
              const accountInfo = await accountInfoResponse.json();
              console.log('accountInfo: ', accountInfo);

              if (accountInfo) {
                  // Store user and account information in local storage
                  localStorage.setItem('userId', userId);
                  localStorage.setItem('accountInfo', JSON.stringify(accountInfo));

                  // Redirect to accountinfo.html
                  console.log('redirecting to accountinfo.html');
                  window.location.href = '/accountinfo.html';
              } else {
                  errorMessage.innerText = 'Failed to fetch account information.';
              }
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
