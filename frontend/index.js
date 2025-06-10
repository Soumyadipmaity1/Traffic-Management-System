document.addEventListener('DOMContentLoaded', function() {
    // Enhanced Tab Switching with Indicator Animation
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const tabContainer = document.querySelector('.tabs');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            
            // Add active class to clicked button
            button.classList.add('active');
            
            // Set data attribute for tab indicator animation
            tabContainer.setAttribute('data-active-tab', button.getAttribute('data-tab'));
            
            // Show corresponding pane
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // Set initial active tab
    tabContainer.setAttribute('data-active-tab', 'liveCamera');
    
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
    
    // Add subtle animations to result meters on load
    function animateResults() {
        // Animate risk meter fill
        const riskMeter = document.querySelector('#accidentRisk .meter-fill');
        if (riskMeter) {
            const width = riskMeter.style.width;
            riskMeter.style.width = '0';
            setTimeout(() => { riskMeter.style.width = width; }, 300);
        }
        
        // Animate numbers with counting effect
        document.querySelectorAll('.count, .risk-value, .gauge-value').forEach(el => {
            const finalValue = el.textContent;
            const duration = 1500;
            const frameRate = 30;
            const increment = parseInt(finalValue) / (duration / frameRate);
            
            let current = 0;
            const counter = setInterval(() => {
                current += increment;
                if (current >= parseInt(finalValue)) {
                    el.textContent = finalValue;
                    clearInterval(counter);
                } else {
                    el.textContent = Math.floor(current);
                }
            }, frameRate);
        });
    }
    
    // Run animation when results are updated
    const originalUpdateResults = window.updateResults || function() {};
    window.updateResults = function(data) {
        originalUpdateResults(data);
        animateResults();
    };
    
    // On first load, animate results after a short delay
    setTimeout(animateResults, 500);
    
    // Add smooth scroll behavior for better UX
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    
    // Enhance form fields with better feedback
    document.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.classList.remove('focused');
        });
    });
});
