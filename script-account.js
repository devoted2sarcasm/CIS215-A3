document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = localStorage.getItem('userId') || urlParams.get('id');
    const accountInfo = JSON.parse(localStorage.getItem('accountInfo'));
    console.log('userId: ', userId);
    console.log('accountInfo: ', accountInfo);

    if (accountInfo) {
        displayAccountInfo(accountInfo);
    };

    function displayAccountInfo(accountInfo) {
        // Display the account information
        document.getElementById('balance-placeholder').innerText = accountInfo.balance;
        document.getElementById('account-number-placeholder').innerText = accountInfo.id;
        document.getElementById('name-placeholder').innerText = accountInfo.firname + ' ' + accountInfo.lasname;
        

  
    function makeDeposit() {
      const amount = document.getElementById('input-amount').value;
      if (!amount || isNaN(amount)) {
        console.error('Invalid amount for deposit.');
        return;
      }
  
      // Make deposit API call
      fetch('/api/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amt: parseFloat(amount), acct: userId }),
      })
        .then(console.log('deposit request sent'))
        .then(console.log('amount: ', amount, '-- userId: ', userId))
        .then(response => response.json())
        .then(() => refreshPage())
        .catch(error => console.error('Error making deposit:', error));
    }
  
    function makeWithdrawal() {
      const amount = document.getElementById('amount').value;
      if (!amount || isNaN(amount)) {
        console.error('Invalid amount for withdrawal.');
        return;
      }
  
      // Make withdrawal API call
      fetch('/api/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amt: parseFloat(amount), acct: userId }),
      })
        .then(response => response.json())
        .then(() => refreshPage())
        .catch(error => console.error('Error making withdrawal:', error));
    }
  
    function navigateToHistory() {
      // Navigate to 'accounthistory.html' with the user's ID
      window.location.href = `/accounthistory.html?id=${userId}`;
    }
  
    function logout() {
        // Implement logout logic, e.g., clearing session or redirecting to the login page
        localStorage.removeItem('userId');
        location.assign("https://localhost:4000/index.html");
      }
    
    function refreshPage() {
        // Refresh the page after making a deposit or withdrawal
        fetch(`/api/accountinfo/${userId}`)
          .then(response => response.json())
          .then(data => displayAccountInfo(data))
          .catch(error => console.error('Error fetching account information:', error));
      }

    // event listeners for the buttons
    document.getElementById('deposit').addEventListener('click', makeDeposit);
    document.getElementById('withdraw').addEventListener('click', makeWithdrawal);
    document.getElementById('history').addEventListener('click', navigateToHistory);
    document.getElementById('logout').addEventListener('click', logout);


});