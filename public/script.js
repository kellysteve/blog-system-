document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const loginSection = document.getElementById('loginSection');
    const adminSection = document.getElementById('adminSection');
    const publicView = document.getElementById('publicView');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const publishBtn = document.getElementById('publishBtn');
    const blogList = document.getElementById('blogList');
    const publicBlogList = document.getElementById('publicBlogList');
    const notification = document.getElementById('notification');
    
    let token = localStorage.getItem('authToken');
    
    // Check if user is logged in
    if (token) {
        showAdminSection();
    } else {
        showLoginSection();
    }
    
    // Load blogs
    loadBlogs();
    
    // Login functionality
    loginBtn.addEventListener('click', function() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                token = data.token;
                localStorage.setItem('authToken', token);
                showAdminSection();
                showNotification('Login successful!');
            } else {
                showNotification('Invalid credentials. Please try again.', true);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showNotification('Login failed. Please try again.', true);
        });
    });
    
    // Logout functionality
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('authToken');
        token = null;
        showLoginSection();
        showNotification('Logged out successfully.');
    });
    
    // Publish blog functionality
    publishBtn.addEventListener('click', function() {
        const title = document.getElementById('blogTitle').value;
        const content = document.getElementById('blogContent').value;
        
        if (title && content) {
            fetch('/api/blogs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, content })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    loadBlogs();
                    
                    // Clear form
                    document.getElementById('blogTitle').value = '';
                    document.getElementById('blogContent').value = '';
                    
                    showNotification('Blog published successfully!');
                } else {
                    showNotification('Failed to publish blog. Please try again.', true);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Failed to publish blog. Please try again.', true);
            });
        } else {
            showNotification('Please fill in both title and content.', true);
        }
    });
    
    // Function to show notification
    function showNotification(message, isError = false) {
        notification.textContent = message;
        notification.className = 'notification';
        notification.classList.add('show');
        
        if (isError) {
            notification.classList.add('error');
        }
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.className = 'notification hidden';
            }, 300);
        }, 3000);
    }
    
    // Function to show admin section
    function showAdminSection() {
        loginSection.classList.add('hidden');
        adminSection.classList.remove('hidden');
        publicView.classList.add('hidden');
    }
    
    // Function to show login section
    function showLoginSection() {
        loginSection.classList.remove('hidden');
        adminSection.classList.add('hidden');
        publicView.classList.remove('hidden');
    }
    
    // Function to load and display blogs
    function loadBlogs() {
        fetch('/api/blogs')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    displayBlogs(data.blogs);
                } else {
                    showNotification('Failed to load blogs.', true);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Failed to load blogs.', true);
            });
    }
    
    // Function to display blogs
    function displayBlogs(blogs) {
        // Clear existing blogs
        blogList.innerHTML = '';
        publicBlogList.innerHTML = '';
        
        if (blogs.length === 0) {
            blogList.innerHTML = '<p>No blogs published yet.</p>';
            publicBlogList.innerHTML = '<p>No blogs available. Check back later!</p>';
            return;
        }
        
        // Display blogs in reverse chronological order
        blogs.reverse().forEach(blog => {
            const blogElement = createBlogElement(blog);
            const publicBlogElement = createBlogElement(blog);
            
            blogList.appendChild(blogElement);
            publicBlogList.appendChild(publicBlogElement);
        });
    }
    
    // Function to create blog element
    function createBlogElement(blog) {
        const blogCard = document.createElement('div');
        blogCard.className = 'blog-card';
        
        const date = new Date(blog.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        blogCard.innerHTML = `
            <div class="blog-content">
                <h3 class="blog-title">${blog.title}</h3>
                <p class="blog-date">Published on: ${date}</p>
                <p class="blog-text">${blog.content}</p>
            </div>
        `;
        
        return blogCard;
    }
});
