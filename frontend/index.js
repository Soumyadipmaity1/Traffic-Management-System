document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Show corresponding pane
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Login Modal Functionality
    const loginBtn = document.getElementById('loginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeBtn = document.querySelector('.close');
    
    loginBtn.addEventListener('click', () => {
        loginModal.style.display = 'flex';
    });
    
    closeBtn.addEventListener('click', () => {
        loginModal.style.display = 'none';
    });
    
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
    });
    
    // Login Form Submission
    const loginForm = document.getElementById('loginForm');
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Here you would typically send a request to your backend
        console.log(`Login attempt: ${username}`);
        
        // Simulate successful login
        alert('Login successful!');
        loginModal.style.display = 'none';
        loginBtn.textContent = username;
    });
    
    // Camera Functionality
    const startCameraBtn = document.getElementById('startCamera');
    const captureImageBtn = document.getElementById('captureImage');
    const cameraFeed = document.getElementById('cameraFeed');
    let stream = null;
    
    startCameraBtn.addEventListener('click', async () => {
        try {
            if (stream) {
                // Stop the camera if it's already running
                stream.getTracks().forEach(track => track.stop());
                stream = null;
                cameraFeed.src = 'camera-placeholder.jpg';
                startCameraBtn.innerHTML = '<i class="fas fa-video"></i> Start Camera';
                captureImageBtn.disabled = true;
                return;
            }
            
            // Request camera access
            stream = await navigator.mediaDevices.getUserMedia({ video: true });
            
            // Create a video element to display the stream
            const video = document.createElement('video');
            video.srcObject = stream;
            video.play();
            
            // Replace the placeholder image with the video stream
            cameraFeed.parentNode.replaceChild(video, cameraFeed);
            video.id = 'cameraFeed';
            
            startCameraBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Camera';
            captureImageBtn.disabled = false;
            
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Unable to access camera. Please check permissions.');
        }
    });
    
    captureImageBtn.addEventListener('click', () => {
        const video = document.getElementById('cameraFeed');
        if (!(video instanceof HTMLVideoElement) || !stream) {
            alert('Camera not started!');
            return;
        }
        
        // Create a canvas to capture the frame
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to image
        const imageDataURL = canvas.toDataURL('image/png');
        
        // Display captured image
        const img = document.createElement('img');
        img.src = imageDataURL;
        img.id = 'cameraFeed';
        video.parentNode.replaceChild(img, video);
        
        // Stop the camera stream
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        
        startCameraBtn.innerHTML = '<i class="fas fa-video"></i> Start Camera';
        captureImageBtn.disabled = true;
        
        // Here you would typically send the image to your backend
        console.log('Image captured');
    });
    
    // File Upload Functionality
    const dropzone = document.querySelector('.dropzone');
    const fileInput = document.getElementById('fileInput');
    const uploadedFilesContainer = document.getElementById('uploadedFiles');
    
    dropzone.addEventListener('click', () => {
        fileInput.click();
    });
    
    dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
    });
    
    dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
    });
    
    dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    function handleFiles(files) {
        uploadedFilesContainer.innerHTML = '';
        
        Array.from(files).forEach(file => {
            const fileElement = document.createElement('div');
            fileElement.classList.add('uploaded-file');
            
            let icon = 'fa-file';
            if (file.type.startsWith('image/')) icon = 'fa-file-image';
            if (file.type.startsWith('video/')) icon = 'fa-file-video';
            
            fileElement.innerHTML = `
                <i class="fas ${icon}"></i>
                <span>${file.name}</span>
                <span class="file-size">${formatFileSize(file.size)}</span>
            `;
            
            uploadedFilesContainer.appendChild(fileElement);
        });
    }
    
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    // Location Detection
    const locationInput = document.getElementById('location');
    const locationBtn = document.querySelector('.btn-location');
    
    locationBtn.addEventListener('click', () => {
        if (navigator.geolocation) {
            locationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;
                    
                    // Reverse geocoding with OpenStreetMap Nominatim API
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                        .then(response => response.json())
                        .then(data => {
                            locationInput.value = data.display_name;
                            locationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
                        })
                        .catch(error => {
                            console.error('Error getting location name:', error);
                            locationInput.value = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
                            locationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
                        });
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to retrieve your location. Please check permissions.');
                    locationBtn.innerHTML = '<i class="fas fa-map-marker-alt"></i>';
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    });
    
    // Form Submission and Analysis
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultsSection = document.getElementById('resultsSection');
    
    analyzeBtn.addEventListener('click', () => {
        // Validate location
        if (!locationInput.value) {
            alert('Please enter a location or use current location.');
            return;
        }
        
        // Show loading state
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        
        // Determine which tab is active
        const activeTab = document.querySelector('.tab-pane.active').id;
        
        // Collect data based on active tab
        let data = {
            location: locationInput.value,
            source: activeTab
        };
        
        if (activeTab === 'manualEntry') {
            data.vehicleCount = document.getElementById('vehicleCount').value;
            data.carCount = document.getElementById('carCount').value;
            data.truckCount = document.getElementById('truckCount').value;
            data.busCount = document.getElementById('busCount').value;
            data.bikeCount = document.getElementById('bikeCount').value;
            data.avgSpeed = document.getElementById('avgSpeed').value;
            data.trafficDensity = document.getElementById('trafficDensity').value;
        }
        
        // Simulate API call with timeout
        setTimeout(() => {
            // In a real application, you would send data to your backend
            console.log('Analysis data:', data);
            
            // Update result values based on data
            updateResults(data);
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
            
            // Reset button
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = 'Analyze Traffic <i class="fas fa-chart-line"></i>';
        }, 2000);
    });
    
    function updateResults(data) {
        // In a real application, these values would come from your backend
        // Here we're just generating random values for demonstration
        
        // Update accident risk
        const riskPercent = Math.floor(Math.random() * 100);
        document.querySelector('#accidentRisk .meter-fill').style.width = `${riskPercent}%`;
        document.querySelector('#accidentRisk .risk-value').textContent = `${riskPercent}%`;
        
        let riskStatus = 'Low Risk';
        if (riskPercent > 75) riskStatus = 'High Risk';
        else if (riskPercent > 50) riskStatus = 'Moderate Risk';
        else if (riskPercent > 25) riskStatus = 'Low Risk';
        document.querySelector('#accidentRisk .risk-status').textContent = riskStatus;
        
        // Update vehicle counts
        if (data.source === 'manualEntry') {
            // Use provided values if available
            const cars = data.carCount || '0';
            const trucks = data.truckCount || '0';
            const buses = data.busCount || '0';
            const bikes = data.bikeCount || '0';
            const total = parseInt(cars) + parseInt(trucks) + parseInt(buses) + parseInt(bikes);
            
            document.querySelectorAll('#vehicleCount .vehicle-stat')[0].querySelector('.count').textContent = cars;
            document.querySelectorAll('#vehicleCount .vehicle-stat')[1].querySelector('.count').textContent = trucks;
            document.querySelectorAll('#vehicleCount .vehicle-stat')[2].querySelector('.count').textContent = buses;
            document.querySelectorAll('#vehicleCount .vehicle-stat')[3].querySelector('.count').textContent = bikes;
            document.querySelector('#vehicleCount .total span:last-child').textContent = total;
        } else {
            // Generate random values
            const cars = Math.floor(Math.random() * 50);
            const trucks = Math.floor(Math.random() * 10);
            const buses = Math.floor(Math.random() * 5);
            const bikes = Math.floor(Math.random() * 20);
            const total = cars + trucks + buses + bikes;
            
            document.querySelectorAll('#vehicleCount .vehicle-stat')[0].querySelector('.count').textContent = cars;
            document.querySelectorAll('#vehicleCount .vehicle-stat')[1].querySelector('.count').textContent = trucks;
            document.querySelectorAll('#vehicleCount .vehicle-stat')[2].querySelector('.count').textContent = buses;
            document.querySelectorAll('#vehicleCount .vehicle-stat')[3].querySelector('.count').textContent = bikes;
            document.querySelector('#vehicleCount .total span:last-child').textContent = total;
        }
        
        // Update speed estimation
        let speed;
        if (data.source === 'manualEntry' && data.avgSpeed) {
            speed = parseInt(data.avgSpeed);
        } else {
            speed = Math.floor(Math.random() * 100);
        }
        
        document.querySelector('#speedEstimation .gauge-value').textContent = speed;
        
        let speedMessage = 'Average traffic speed is within limit';
        if (speed > 80) speedMessage = 'Average traffic speed is above limit';
        else if (speed < 20) speedMessage = 'Traffic is moving very slowly';
        document.querySelector('#speedEstimation .card-content p').textContent = speedMessage;
        
        // Update stop alert
        const showAlert = Math.random() > 0.5;
        const alertCard = document.getElementById('stopAlert');
        
        if (showAlert) {
            alertCard.style.display = 'block';
            if (riskPercent > 70) {
                document.querySelector('#stopAlert .alert-text').textContent = 'High Accident Risk';
                document.querySelector('#stopAlert .card-content p').textContent = 'Immediate traffic control recommended';
            } else {
                document.querySelector('#stopAlert .alert-text').textContent = 'Congestion Detected';
                document.querySelector('#stopAlert .card-content p').textContent = `Traffic flow restriction recommended at ${data.location.split(',')[0]}`;
            }
        } else {
            alertCard.style.display = 'none';
        }
    }
});
