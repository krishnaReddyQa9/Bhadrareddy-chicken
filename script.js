// Define users at the top level
const users = {
    "Raghava": "Krishna@123",
    "Bhadra": "Krishna@123"
};

let totalHeans = 0;
let rates = {
    skin: 0,
    skinless: 0
};
let workers = [];
let orders = [];
let heansLog = [];

function login() {
    const loginId = document.getElementById('loginId').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    if (users[loginId] === password) {
        document.getElementById('login-form').classList.add('hidden');
        document.getElementById('home').classList.remove('hidden');
        alert(`Hi ${loginId}, Happy Morning!`);
    } else {
        errorMessage.innerText = "Invalid details, contact support.";
    }
}

function logout() {
    document.getElementById('home').classList.add('hidden');
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('loginId').value = '';
    document.getElementById('password').value = '';
}

function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.add('hidden');
    });
    document.getElementById(tabName).classList.remove('hidden');
    updateDashboard();
}

function addHeans() {
    const quantity = parseInt(document.getElementById('heans-quantity').value);
    const timestamp = new Date().toLocaleString();
    if (!isNaN(quantity) && quantity > 0) {
        totalHeans += quantity;
        heansLog.push({ quantity, timestamp });
        document.getElementById('heans-quantity').value = '';
        alert(`Heans added: ${quantity} at ${timestamp}`);
        updateDashboard();
        displayHeansLog();
    } else {
        alert('Please enter a valid quantity.');
    }
}

function displayHeansLog() {
    const logDiv = document.getElementById('heans-log');
    logDiv.innerHTML = '<h4>Heans Log:</h4>';
    heansLog.forEach(entry => {
        logDiv.innerHTML += `<p>${entry.quantity} added on ${entry.timestamp}</p>`;
    });
}

function addRate() {
    const skinRate = parseFloat(document.getElementById('rate-skin').value);
    const skinlessRate = parseFloat(document.getElementById('rate-skinless').value);
    rates.skin = skinRate;
    rates.skinless = skinlessRate;
    alert(`Rates saved: Skin - ${skinRate}, Skinless - ${skinlessRate}`);
    document.getElementById('rate-skin').value = '';
    document.getElementById('rate-skinless').value = '';
}

function addWorker() {
    const name = document.getElementById('worker-name').value;
    const contact = document.getElementById('worker-contact').value;
    if (name && contact) {
        workers.push({ name, contact, present: false, amount: 0, dailyAmount: 0 });
        document.getElementById('worker-name').value = '';
        document.getElementById('worker-contact').value = '';
        renderWorkers();
        populateWorkerSelect();
    } else {
        alert('Please enter valid worker details.');
    }
}

function renderWorkers() {
    const workerList = document.getElementById('workers-list');
    workerList.innerHTML = '';
    workers.forEach((worker, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${worker.name}</td>
            <td>${worker.contact}</td>
            <td><input type="checkbox" onchange="toggleAttendance(this, ${index}, 'present')"></td>
            <td><input type="checkbox" onchange="toggleAttendance(this, ${index}, 'absent')"></td>
            <td><input type="number" placeholder="Amount" onchange="updateAmount(this, ${index})"></td>
            <td><button onclick="removeWorker(${index})">Remove</button></td>
        `;
        workerList.appendChild(row);
    });
}

function populateWorkerSelect() {
    const select = document.getElementById('assigned-worker');
    select.innerHTML = '';
    workers.forEach((worker, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = worker.name;
        select.appendChild(option);
    });
}

function toggleAttendance(checkbox, index, type) {
    if (type === 'present') {
        workers[index].present = checkbox.checked;
        if (checkbox.checked) {
            workers[index].dailyAmount = 0; // Reset daily amount when present
        }
    } else if (type === 'absent') {
        workers[index].present = !checkbox.checked; // Ensure only one can be checked at a time
        document.querySelectorAll(`#workers-list input[type="checkbox"][onchange*="absent"]`).forEach((cb, idx) => {
            if (idx !== index) cb.checked = false;
        });
    }
    updateDashboard();
}

function updateAmount(input, index) {
    const amount = parseFloat(input.value);
    if (!isNaN(amount) && amount >= 0) {
        workers[index].dailyAmount += amount;
        alert(`Amount of ${amount} added for ${workers[index].name}.`);
    }
}

function submitOrder(event) {
    event.preventDefault();
    const customerName = event.target[0].value;
    const contactNumber = event.target[1].value;
    const address = event.target[2].value;
    const quantity = parseInt(event.target[3].value);
    const assignedWorkerIndex = event.target[4].value;

    if (customerName && contactNumber && address && !isNaN(quantity) && quantity > 0) {
        const assignedWorker = workers[assignedWorkerIndex];
        const order = {
            customerName,
            contactNumber,
            address,
            quantity,
            assignedWorker: assignedWorker.name,
            status: 'Cutting',
            date: new Date().toLocaleString()
        };
        orders.push(order);
        alert(`Order for ${customerName} added.`);
        updateDashboard();
        event.target.reset();
    } else {
        alert('Please fill in all fields correctly.');
    }
}

function updateDashboard() {
    const availableWorkers = workers.filter(worker => worker.present).length;
    document.getElementById('available-workers').innerText = availableWorkers;
    document.getElementById('total-heans').innerText = totalHeans;
    document.getElementById('rates-info').innerText = `Skin: ${rates.skin}, Skinless: ${rates.skinless}`;
    renderOrderTracking();
}

function renderOrderTracking() {
    const orderTrackingList = document.getElementById('order-tracking-list');
    orderTrackingList.innerHTML = '';
    orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${order.customerName}</td>
            <td>${order.quantity}</td>
            <td>${order.assignedWorker}</td>
            <td>${order.status}</td>
        `;
        orderTrackingList.appendChild(row);
    });
}

function generateReport() {
    const reportType = document.getElementById('report-type').value;
    const reportDate = new Date(document.getElementById('report-date').value);
    let filteredOrders = [];

    // Filter orders based on report type
    if (reportType === 'daily') {
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.toDateString() === reportDate.toDateString();
        });
    } else if (reportType === 'weekly') {
        const startOfWeek = new Date(reportDate);
        const endOfWeek = new Date(reportDate);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        endOfWeek.setDate(endOfWeek.getDate() + (6 - endOfWeek.getDay()));
        
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate >= startOfWeek && orderDate <= endOfWeek;
        });
    } else if (reportType === 'monthly') {
        filteredOrders = orders.filter(order => {
            const orderDate = new Date(order.date);
            return orderDate.getMonth() === reportDate.getMonth() && orderDate.getFullYear() === reportDate.getFullYear();
        });
    }

    // Prepare report data
    const reportData = [
        ["Report Type", "Customer Name", "Address", "Quantity", "Rate", "Date"],
        ...filteredOrders.map(order => [
            reportType,
            order.customerName,
            order.address,
            order.quantity,
            rates.skin, // Assuming rate for all orders is skin rate
            order.date
        ]),
        [],
        ["Worker Name", "Present/Absent", "Total Amount Taken", "Date and Time"],
        ...workers.map(worker => [
            worker.name,
            worker.present ? 'Present' : 'Absent',
            worker.dailyAmount,
            new Date().toLocaleString()
        ])
    ];

    // Create workbook and add data
    const worksheet = XLSX.utils.aoa_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');
    
    // Generate download
    const reportFileName = `report_${reportType}_${reportDate.toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, reportFileName);
}

function removeWorker(index) {
    workers.splice(index, 1);
    renderWorkers();
    populateWorkerSelect();
}
