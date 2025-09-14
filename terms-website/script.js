// TSV Trudering Training Polls System - Frontend Logic
document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const DEMO_USERS = {
        'admin@tsv.com': { password: 'admin123', role: 'admin', name: 'Admin User' },
        'member@tsv.com': { password: 'member123', role: 'member', name: 'Member User' }
    };
    
    const STORAGE_KEYS = {
        USER: 'tsv_user',
        POLLS: 'tsv_polls',
        VOTES: 'tsv_votes',
        THEME: 'tsv_theme'
    };
    
    // Elements - get references after DOM is loaded
    let loginModal, adminBtn, memberBtn, loginForm, loginOptions;
    let userEmail, userPassword, loginSubmit, backBtn;
    let userInfo, userRole, logoutBtn;
    let memberDashboard, adminDashboard;
    let themeToggle, themeIcon, themeTransition;

    // Global variables
    let currentUser = null;
    let selectedRole = null;
    
    // Initialize application
    initializeApp();

    function initializeApp() {
        // Get DOM elements
        getElementReferences();
        
        initializeTheme();
        initializeDemoData();
        
        // Check if user is already logged in
        const savedUser = JSON.parse(localStorage.getItem(STORAGE_KEYS.USER) || 'null');
        if (savedUser) {
            loginUser(savedUser);
        } else {
            showLoginModal();
        }
        
        setupEventListeners();
        setMinDate();
    }

    function getElementReferences() {
        loginModal = document.getElementById('loginModal');
        adminBtn = document.getElementById('adminBtn');
        memberBtn = document.getElementById('memberBtn');
        loginForm = document.getElementById('loginForm');
        loginOptions = document.getElementById('loginOptions');
        userEmail = document.getElementById('userEmail');
        userPassword = document.getElementById('userPassword');
        loginSubmit = document.getElementById('loginSubmit');
        backBtn = document.getElementById('backBtn');
        userInfo = document.getElementById('userInfo');
        userRole = document.getElementById('userRole');
        logoutBtn = document.getElementById('logoutBtn');
        memberDashboard = document.getElementById('memberDashboard');
        adminDashboard = document.getElementById('adminDashboard');
        themeToggle = document.getElementById('themeToggle');
        themeIcon = document.getElementById('themeIcon');
        themeTransition = document.getElementById('themeTransition');

        // Debug logging
        console.log('Elements found:', {
            loginModal: !!loginModal,
            adminBtn: !!adminBtn,
            memberBtn: !!memberBtn
        });
    }

    function initializeTheme() {
        const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
        setTheme(savedTheme);
    }

    function initializeDemoData() {
        // Initialize with some demo polls if none exist
        const existingPolls = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLLS) || '[]');
        if (existingPolls.length === 0) {
            const demoPolls = generateDemoPolls();
            localStorage.setItem(STORAGE_KEYS.POLLS, JSON.stringify(demoPolls));
        }
        
        // Initialize votes if none exist
        const existingVotes = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTES) || '[]');
        if (existingVotes.length === 0) {
            localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify([]));
        }
    }

    function generateDemoPolls() {
        const polls = [];
        const today = new Date();
        
        // Create sample polls
        for (let i = 1; i <= 3; i++) {
            const trainingDate = new Date(today);
            trainingDate.setDate(today.getDate() + (i * 7));
            
            const deadline = new Date(trainingDate);
            deadline.setDate(trainingDate.getDate() - 2);
            
            const times = ['10:00', '14:00', '16:00'];
            const locations = ['Main Gym', 'Court 1', 'Outdoor Court'];
            
            polls.push({
                id: 'poll_' + Date.now() + '_' + i,
                title: 'Week ' + i + ' Basketball Training Session',
                description: 'Join us for an intensive basketball training session. We will focus on fundamental skills, team coordination, and match preparation.',
                trainingDate: trainingDate.toISOString().split('T')[0],
                trainingTime: times[i - 1],
                deadline: deadline.toISOString().split('T')[0],
                location: locations[i - 1],
                status: deadline > today ? 'active' : 'expired',
                createdBy: 'admin@tsv.com',
                createdAt: new Date(today.getTime() - (i * 24 * 60 * 60 * 1000)).toISOString()
            });
        }
        
        return polls;
    }

    function setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Login modal events
        if (adminBtn) {
            console.log('Admin button found, adding listener');
            adminBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Admin button clicked');
                selectRole('admin');
            });
        } else {
            console.error('Admin button not found!');
        }
        
        if (memberBtn) {
            console.log('Member button found, adding listener');
            memberBtn.addEventListener('click', function(e) {
                e.preventDefault();
                console.log('Member button clicked');
                selectRole('member');
            });
        } else {
            console.error('Member button not found!');
        }
        
        if (loginSubmit) {
            loginSubmit.addEventListener('click', function(e) {
                e.preventDefault();
                handleLogin();
            });
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                showRoleSelection();
            });
        }
        
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
        
        // Theme toggle
        if (themeToggle) {
            themeToggle.addEventListener('click', function(e) {
                e.preventDefault();
                toggleTheme();
            });
        }
        
        // Admin dashboard events
        setupAdminEventListeners();
        
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
        
        // Enter key support for login
        if (userPassword) {
            userPassword.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleLogin();
                }
            });
        }
        
        console.log('Event listeners setup complete');
    }

    function setupAdminEventListeners() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                switchTab(e.target.dataset.tab);
            });
        });
        
        // Create poll
        const createPoll = document.getElementById('createPoll');
        if (createPoll) {
            createPoll.addEventListener('click', handleCreatePoll);
        }
        
        // Status filter
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', loadManagePolls);
        }
    }

    function setMinDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInputs = ['pollDate', 'pollDeadline'];
        dateInputs.forEach(function(id) {
            const element = document.getElementById(id);
            if (element) element.min = today;
        });
    }

    // Authentication Functions
    function selectRole(role) {
        console.log('Selecting role:', role);
        selectedRole = role;
        if (loginOptions) loginOptions.style.display = 'none';
        if (loginForm) loginForm.style.display = 'block';
        if (userEmail) userEmail.focus();
    }

    function showRoleSelection() {
        selectedRole = null;
        if (loginOptions) loginOptions.style.display = 'block';
        if (loginForm) loginForm.style.display = 'none';
        if (userEmail) userEmail.value = '';
        if (userPassword) userPassword.value = '';
    }

    function handleLogin() {
        if (!userEmail || !userPassword) return;
        
        const email = userEmail.value.trim();
        const password = userPassword.value;
        
        if (!email || !password) {
            showNotification('Please enter both email and password', 'error');
            return;
        }
        
        const user = DEMO_USERS[email];
        if (!user || user.password !== password) {
            showNotification('Invalid email or password', 'error');
            return;
        }
        
        if (selectedRole && user.role !== selectedRole) {
            showNotification('This account is not registered as ' + selectedRole, 'error');
            return;
        }
        
        const userData = {
            email: email,
            name: user.name,
            role: user.role,
            loginTime: new Date().toISOString()
        };
        
        loginUser(userData);
    }

    function loginUser(userData) {
        currentUser = userData;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
        
        hideLoginModal();
        showUserInfo();
        
        if (userData.role === 'admin') {
            showAdminDashboard();
        } else {
            showMemberDashboard();
        }
        
        showNotification('Welcome back, ' + userData.name + '!', 'success');
    }

    function logout() {
        currentUser = null;
        localStorage.removeItem(STORAGE_KEYS.USER);
        hideUserInfo();
        hideDashboards();
        showLoginModal();
        showNotification('Logged out successfully', 'success');
    }

    // UI Display Functions
    function showLoginModal() {
        if (loginModal) loginModal.style.display = 'flex';
        showRoleSelection();
    }

    function hideLoginModal() {
        if (loginModal) loginModal.style.display = 'none';
    }

    function showUserInfo() {
        if (userInfo) userInfo.style.display = 'flex';
        if (userRole) userRole.textContent = currentUser.role === 'admin' ? '👑 Administrator' : '👤 Member';
    }

    function hideUserInfo() {
        if (userInfo) userInfo.style.display = 'none';
    }

    function showMemberDashboard() {
        if (memberDashboard) memberDashboard.style.display = 'block';
        if (adminDashboard) adminDashboard.style.display = 'none';
        loadActivePolls();
        loadMemberVotes();
    }

    function showAdminDashboard() {
        if (adminDashboard) adminDashboard.style.display = 'block';
        if (memberDashboard) memberDashboard.style.display = 'none';
        loadManagePolls();
        loadPollResults();
        updatePollStatistics();
    }

    function hideDashboards() {
        if (memberDashboard) memberDashboard.style.display = 'none';
        if (adminDashboard) adminDashboard.style.display = 'none';
    }

    // Member Functions
    function loadActivePolls() {
        const polls = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLLS) || '[]');
        const votes = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTES) || '[]');
        const today = new Date().toISOString().split('T')[0];
        
        // Filter active polls
        const activePolls = polls.filter(function(poll) {
            return poll.deadline >= today;
        });
        
        displayActivePolls(activePolls, votes);
    }

    function displayActivePolls(polls, votes) {
        const container = document.getElementById('activePolls');
        if (!container) return;
        
        if (polls.length === 0) {
            container.innerHTML = '<div class="no-voters">No active polls available</div>';
            return;
        }
        
        const pollsHTML = polls.map(function(poll) {
            const userVote = votes.find(function(vote) {
                return vote.pollId === poll.id && vote.userEmail === currentUser.email;
            });
            
            const pollVotes = votes.filter(function(vote) {
                return vote.pollId === poll.id;
            });
            
            const yesVotes = pollVotes.filter(function(vote) {
                return vote.answer === 'yes';
            }).length;
            
            const noVotes = pollVotes.filter(function(vote) {
                return vote.answer === 'no';
            }).length;
            
            return '<div class="poll-card">' +
                '<div class="poll-header">' +
                    '<div class="poll-info">' +
                        '<h3 class="poll-title">' + poll.title + '</h3>' +
                        '<div class="poll-meta">' +
                            '<span>📅 ' + formatDate(poll.trainingDate) + '</span>' +
                            '<span>🕐 ' + formatTime(poll.trainingTime) + '</span>' +
                            (poll.location ? '<span>📍 ' + poll.location + '</span>' : '') +
                            '<span>⏰ Deadline: ' + formatDate(poll.deadline) + '</span>' +
                        '</div>' +
                    '</div>' +
                    '<div class="poll-status active">Active</div>' +
                '</div>' +
                '<p class="poll-description">' + poll.description + '</p>' +
                '<div class="voting-section">' +
                    '<h4>Will you attend this training session?</h4>' +
                    '<div class="voting-buttons">' +
                        '<button class="vote-btn yes ' + (userVote && userVote.answer === 'yes' ? 'selected' : '') + '" ' +
                                'onclick="castVote(\'' + poll.id + '\', \'yes\')" ' +
                                (userVote ? 'disabled' : '') + '>' +
                            '✅ Yes, I will attend' +
                        '</button>' +
                        '<button class="vote-btn no ' + (userVote && userVote.answer === 'no' ? 'selected' : '') + '" ' +
                                'onclick="castVote(\'' + poll.id + '\', \'no\')" ' +
                                (userVote ? 'disabled' : '') + '>' +
                            '❌ No, I cannot attend' +
                        '</button>' +
                    '</div>' +
                    (userVote ? '<p style="text-align: center; margin-top: 1rem; color: #64748b;">' +
                        'You voted: <strong>' + (userVote.answer === 'yes' ? 'Yes' : 'No') + '</strong>' +
                        '</p>' : '') +
                    '<div class="vote-results">' +
                        '<div class="vote-count yes">' +
                            '<div>✅ Yes</div>' +
                            '<div>' + yesVotes + ' votes</div>' +
                        '</div>' +
                        '<div class="vote-count no">' +
                            '<div>❌ No</div>' +
                            '<div>' + noVotes + ' votes</div>' +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';
        }).join('');
        
        container.innerHTML = pollsHTML;
    }

    function castVote(pollId, answer) {
        const votes = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTES) || '[]');
        
        // Check if user already voted
        const existingVote = votes.find(function(vote) {
            return vote.pollId === pollId && vote.userEmail === currentUser.email;
        });
        
        if (existingVote) {
            showNotification('You have already voted on this poll', 'warning');
            return;
        }
        
        const newVote = {
            id: 'vote_' + Date.now(),
            pollId: pollId,
            userEmail: currentUser.email,
            userName: currentUser.name,
            answer: answer,
            votedAt: new Date().toISOString()
        };
        
        votes.push(newVote);
        localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));
        
        showNotification('Vote cast: ' + (answer === 'yes' ? 'Yes' : 'No'), 'success');
        loadActivePolls(); // Refresh the display
        loadMemberVotes(); // Refresh vote history
    }

    function loadMemberVotes() {
        const votes = JSON.parse(localStorage.getItem(STORAGE_KEYS.VOTES) || '[]');
        const polls = JSON.parse(localStorage.getItem(STORAGE_KEYS.POLLS) || '[]');
        
        const memberVotes = votes.filter(function(vote) {
            return vote.userEmail === currentUser.email;
        });
        
        // Combine votes with poll details
        const votesWithDetails = memberVotes.map(function(vote) {
            const poll = polls.find(function(p) {
                return p.id === vote.pollId;
            });
            return Object.assign({}, vote, poll);
        }).sort(function(a, b) {
            return new Date(b.votedAt) - new Date(a.votedAt);
        });
        
        displayMemberVotes(votesWithDetails);
    }

    function displayMemberVotes(votes) {
        const container = document.getElementById('memberVotes');
        if (!container) return;
        
        if (votes.length === 0) {
            container.innerHTML = '<div class="no-voters">No votes cast yet</div>';
            return;
        }
        
        const votesHTML = votes.map(function(vote) {
            return '<div class="vote-card voted-' + vote.answer + '">' +
                '<div class="vote-header">' +
                    '<span class="vote-title">' + vote.title + '</span>' +
                    '<span class="vote-badge ' + vote.answer + '">' + (vote.answer === 'yes' ? 'Yes' : 'No') + '</span>' +
                '</div>' +
                '<div class="vote-date">' +
                    'Training: ' + formatDate(vote.trainingDate) + ' at ' + formatTime(vote.trainingTime) + ' • ' +
                    'Voted: ' + formatDateTime(vote.votedAt) +
                '</div>' +
            '</div>';
        }).join('');
        
        container.innerHTML = votesHTML;
    }

    // Theme Functions
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (themeIcon) themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem(STORAGE_KEYS.THEME, theme);
    }

    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Show transition
        if (themeTransition) themeTransition.classList.add('active');
        if (themeToggle) themeToggle.style.transform = 'scale(1.2) rotate(180deg)';
        
        setTimeout(function() {
            setTheme(newTheme);
            setTimeout(function() {
                if (themeTransition) themeTransition.classList.remove('active');
                if (themeToggle) themeToggle.style.transform = 'scale(1) rotate(0deg)';
            }, 300);
        }, 200);
    }

    // Utility Functions
    function formatTime(timeString) {
        if (!timeString) return '';
        const parts = timeString.split(':');
        const hours = parseInt(parts[0]);
        const minutes = parts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHour = hours % 12 || 12;
        return displayHour + ':' + minutes + ' ' + ampm;
    }

    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    function formatDateTime(isoString) {
        if (!isoString) return '';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    }

    function showNotification(message, type) {
        const container = document.getElementById('notifications');
        if (!container) return;
        
        const notification = document.createElement('div');
        notification.className = 'notification ' + (type || 'info');
        notification.textContent = message;
        
        container.appendChild(notification);
        
        setTimeout(function() {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(function() {
            notification.classList.remove('show');
            setTimeout(function() {
                if (container.contains(notification)) {
                    container.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    // Placeholder functions for admin features
    function loadManagePolls() {
        console.log('Load manage polls called');
    }

    function loadPollResults() {
        console.log('Load poll results called');
    }

    function updatePollStatistics() {
        console.log('Update poll statistics called');
    }

    function handleCreatePoll() {
        console.log('Handle create poll called');
    }

    function switchTab(tabName) {
        console.log('Switch tab called:', tabName);
    }

    // Global function for HTML onclick handlers
    window.showLoginModal = showLoginModal;
    window.castVote = castVote;
});