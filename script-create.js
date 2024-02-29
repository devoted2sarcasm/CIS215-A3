document.addEventListener('DOMContentLoaded', () => {
    const createButton = document.getElementById('create');
    createButton.addEventListener('click', handleCreate);
  
    function handleCreate() {
      const firstName = document.getElementById('firname').value.trim();
      const middleName = document.getElementById('midname').value.trim();
      const lastName = document.getElementById('lasname').value.trim();
      const email = document.getElementById('email').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const street = document.getElementById('street').value.trim();
      const zip = document.getElementById('zip').value.trim();
      const password = document.getElementById('password').value.trim();
      const password2 = document.getElementById('password2').value.trim();
  
      // Simple form validation
      if (!firstName || !lastName || !email || !phone || !street || !zip || !password || !password2) {
        displayErrorMessage('All fields are required.');
        return;
      }
  
      if (password !== password2) {
        displayErrorMessage('Passwords do not match.');
        return;
      }
  
      // If all validations pass, make API call to create the account
      const data = {
        fn: firstName,
        mn: middleName,
        ln: lastName,
        em: email,
        ph: phone,
        sa: street,
        zip: parseInt(zip),
        pw: password,
      };
  
      fetch('/api/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => {
          if (response.ok) {
            // Account creation successful, redirect to index.html or display a success message
            window.location.href = 'index.html';
          } else {
            // Account creation failed, display an error message
            return response.text().then((errorMessage) => {
              displayErrorMessage(errorMessage);
            });
          }
        })
        .catch((error) => {
          console.error('Error creating account:', error);
          displayErrorMessage('An error occurred. Please try again later.');
        });
    }
  
    function displayErrorMessage(message) {
      const errorMessageElement = document.getElementById('message');
      errorMessageElement.textContent = message;
    }
  });
  