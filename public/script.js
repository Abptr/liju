document.addEventListener('DOMContentLoaded', () => {
    fetch('/arrivals') // API endpoint to fetch all arrival
        .then(response => response.json())
        .then(data => {
            const arrivalList = document.getElementById('arrivalList');
            data.forEach(aggregated_arrival => {
                const li = document.createElement('li');
                li.textContent = `${aggregated_arrival.stockId} ${aggregated_arrival.coffeeName} - ${aggregated_arrival.total_number_of_bagbox } KG`;
                li.dataset.stockId = aggregated_arrival.stockId;
                li.addEventListener('click', () => loadArrivalDetails(aggregated_arrival.stockId));
                arrivalList.appendChild(li);
            });
        })
        .catch(error => console.error('Error fetching arrivals:', error));
});

function loadArrivalDetails(stockId) {
    fetch(`/arrival-details/${stockId}`) // API endpoint to fetch details by orderId
        .then(response => response.json())
        .then(data => {
            const arrivalDetails = document.getElementById('arrivalDetails');
            arrivalDetails.innerHTML = `
                <h2>${data.coffeeName}</h2>
                <h4>Net Weight:</h4> ${data.net_kg } KG Available in stock
                <h3>Coffee Details</h3>
                <ul>
                    ${data.coffees.map(coffee => `
                        <li>
                            <strong>${coffee.coffee_name}:</strong> 
                            ${coffee.total_number_of_bagbox } KG ordere, 
                            ${coffee.total_number_of_bagbox } KG available
                        </li>
                    `).join('')}
                </ul>
            `;
        })
        
        .catch(error => console.error('Error fetching order details:', error));
}
function fetchCoffeeData(inputElement) {
    const coffeeId = inputElement.value;
    const propertyCount = inputElement.id.match(/\d+/)[0]; // Extract the property count number from the input ID

    if (coffeeId) {
        fetch(`/path-to-your-server-script?coffeeId=${coffeeId}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Fill in the fields with the fetched data
                    document.getElementById(`coffee_name${propertyCount}`).value = data.coffee_name;
                    document.getElementById(`available_coffee_BG${propertyCount}`).value = data.available_coffee_BG;
                    document.getElementById(`available_coffee_KG${propertyCount}`).value = data.available_coffee_KG;
                } else {
                    // Clear the fields if no data found
                    document.getElementById(`coffee_name${propertyCount}`).value = '';
                    document.getElementById(`available_coffee_BG${propertyCount}`).value = '';
                    document.getElementById(`available_coffee_KG${propertyCount}`).value = '';
                    alert('Coffee ID not found.');
                }
            })
            .catch(error => {
                console.error('Error fetching coffee data:', error);
            });
    }
}
