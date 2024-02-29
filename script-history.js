document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id');
  
    if (userId) {
      // Fetch username for the header
      fetch(`/api/accountinfo/${userId}`)
        .then(response => response.json())
        .then(data => displayUsername(data))
        .catch(error => console.error('Error fetching username:', error));
  
      // Fetch recent transactions
      fetch(`/api/transactions/${userId}`)
        .then(response => response.json())
        .then(data => displayTransactions(data))
        .catch(error => console.error('Error fetching transactions:', error));
    } else {
      console.error('User ID not provided.');
    }
  
    function displayUsername(data) {
      if (data) {
        const { firname, lasname } = data;
        document.getElementById('username').innerText = `${firname} ${lasname}'s Transaction History`;
      } else {
        console.error('Error fetching username.');
      }
    }
  
    function displayTransactions(transactions) {
      const tableBody = document.getElementById('transactionTableBody');
  
      if (transactions && transactions.length > 0) {
        transactions.forEach(transaction => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${transaction.type}</td>
            <td>${transaction.amt.toFixed(2)}</td>
            <td>${transaction.end_bal.toFixed(2)}</td>
            <td>${transaction.timestamp}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        const row = document.createElement('tr');
        row.innerHTML = '<td colspan="4">No transactions available</td>';
        tableBody.appendChild(row);
      }
    }
  
  });
  