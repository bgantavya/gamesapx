// Switch between login and register tabs
document.getElementById('login-tab').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('login-tab').classList.add('active');
    document.getElementById('register-tab').classList.remove('active');
});

document.getElementById('register-tab').addEventListener('click', () => {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('login-tab').classList.remove('active');
    document.getElementById('register-tab').classList.add('active');
});

// Handle registration
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        const messageDiv = document.getElementById('register-message');
        
        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Registration successful! Please login.';
            document.getElementById('registerForm').reset();
            setTimeout(() => {
                document.getElementById('login-tab').click();
            }, 1500);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.error || 'Registration failed';
        }
    } catch (error) {
        const messageDiv = document.getElementById('register-message');
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Registration failed. Please try again.';
    }
});

// Handle login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        const messageDiv = document.getElementById('login-message');
        
        if (response.ok) {
            messageDiv.className = 'message success';
            messageDiv.textContent = 'Login successful! Redirecting...';
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);
        } else {
            messageDiv.className = 'message error';
            messageDiv.textContent = data.error || 'Login failed';
        }
    } catch (error) {
        const messageDiv = document.getElementById('login-message');
        messageDiv.className = 'message error';
        messageDiv.textContent = 'Login failed. Please try again.';
    }
});
