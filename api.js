// EntreSkill Hub Client API Helper
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://entreskill-hub-qafi.onrender.com/api/v1';

// Save tokens helper
function setTokens(accessToken, refreshToken) {
    if (accessToken && accessToken !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
    } else {
        localStorage.removeItem('accessToken');
    }
    if (refreshToken && refreshToken !== 'undefined') {
        localStorage.setItem('refreshToken', refreshToken);
    } else {
        localStorage.removeItem('refreshToken');
    }
}

function getAccessToken() {
    return localStorage.getItem('accessToken');
}

function getRefreshToken() {
    return localStorage.getItem('refreshToken');
}

function clearTokens() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user-name');
    localStorage.removeItem('user-email');
    localStorage.removeItem('user-role');
}

// Wrapper for standard fetch that adds auth headers and rotates tokens on 401
async function apiFetch(endpoint, options = {}) {
    options.headers = options.headers || {};
    
    const token = getAccessToken();
    if (token && token !== 'undefined' && token !== 'null') {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    if (!(options.body instanceof FormData) && !options.headers['Content-Type']) {
        options.headers['Content-Type'] = 'application/json';
    }

    let response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // If unauthorized, try to refresh token automatically
    if (response.status === 401) {
        const refresh = getRefreshToken();
        if (refresh && refresh !== 'undefined' && refresh !== 'null') {
            try {
                const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken: refresh })
                });

                if (refreshRes.ok) {
                    const resJson = await refreshRes.json();
                    const data = resJson.data; // Retrieve nested tokens
                    setTokens(data.accessToken, data.refreshToken);
                    
                    // Re-try original request with new token
                    options.headers['Authorization'] = `Bearer ${data.accessToken}`;
                    response = await fetch(`${API_BASE_URL}${endpoint}`, options);
                } else {
                    clearTokens();
                    if (!window.location.pathname.endsWith('join.html') && !window.location.pathname.endsWith('index.html')) {
                        window.location.href = 'join.html';
                    }
                }
            } catch (err) {
                console.error('Failed to rotate token:', err);
            }
        } else {
            if (!window.location.pathname.endsWith('join.html') && !window.location.pathname.endsWith('index.html')) {
                window.location.href = 'join.html';
            }
        }
    }

    return response;
}

// Client-side API hooks
const API = {
    async register(email, password, fullName) {
        const res = await apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, fullName })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Registration failed');
        
        return await this.login(email, password);
    },

    async login(email, password) {
        const res = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Login failed');
        
        const responseData = await res.json();
        const payload = responseData.data; // Retrieve data sub-object
        
        setTokens(payload.accessToken, payload.refreshToken);
        if (payload.user) {
            localStorage.setItem('user-name', payload.user.personalInfo.fullName);
            localStorage.setItem('user-email', payload.user.email);
            localStorage.setItem('user-role', payload.user.role);
        }
        return responseData;
    },

    async logout() {
        const refresh = getRefreshToken();
        if (refresh && refresh !== 'undefined' && refresh !== 'null') {
            await apiFetch('/auth/logout', {
                method: 'POST',
                body: JSON.stringify({ refreshToken: refresh })
            });
        }
        clearTokens();
        window.location.href = 'index.html';
    },

    async getProfile() {
        const res = await apiFetch('/users/profile');
        if (!res.ok) return null;
        return (await res.json()).user;
    },

    async updateOnboarding(skills, interests, budget, experience) {
        const res = await apiFetch('/users/profile', {
            method: 'PUT',
            body: JSON.stringify({
                onboarding: { skills, interests, budget, experience }
            })
        });
        return res.ok;
    },

    async getRecommendations(skills, interests, budget, experience) {
        const res = await apiFetch('/business-ideas/recommendations', {
            method: 'POST',
            body: JSON.stringify({ skills, interests, budget, experience })
        });
        if (!res.ok) return [];
        return (await res.json()).ideas;
    },

    async getRoadmap(ideaId) {
        const res = await apiFetch(`/roadmaps/idea/${ideaId}`);
        if (!res.ok) return null;
        return (await res.json()).roadmap;
    },

    async getProgress() {
        const res = await apiFetch('/progress');
        if (!res.ok) return null;
        return (await res.json()).progress;
    },

    async updateProgress(roadmapId, stepId, isCompleted, totalSteps) {
        const res = await apiFetch('/progress/roadmap', {
            method: 'POST',
            body: JSON.stringify({ roadmapId, stepId, isCompleted, totalStepsCount: totalSteps })
        });
        if (!res.ok) return null;
        return (await res.json()).progress;
    },

    async getMentors() {
        const res = await apiFetch('/users?role=mentor');
        if (!res.ok) return [];
        return (await res.json()).users;
    },

    async bookSession(mentorId, bookingDate, timeSlot, notes) {
        const res = await apiFetch('/bookings', {
            method: 'POST',
            body: JSON.stringify({ mentorId, bookingDate, timeSlot, notes })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Booking failed');
        return (await res.json()).booking;
    }
};

// Expose globally
window.API = API;

// Auth Guard and Dynamic Profile Loader
(function() {
    const isPublicPage = window.location.pathname.endsWith('index.html') || 
                         window.location.pathname.endsWith('join.html') || 
                         window.location.pathname === '/' || 
                         window.location.pathname === '';
    
    const accessToken = localStorage.getItem('accessToken');
    const hasValidToken = accessToken && accessToken !== 'undefined' && accessToken !== 'null';
    
    // Redirect anonymous users to join.html
    if (!hasValidToken && !isPublicPage) {
        window.location.href = 'join.html';
        return;
    }

    // Role-based Access Control (RBAC): Only admins can visit management.html
    if (hasValidToken && window.location.pathname.endsWith('management.html')) {
        const userEmail = localStorage.getItem('user-email') || '';
        const userRole = localStorage.getItem('user-role') || '';
        if (!userEmail.includes('admin') && userRole !== 'admin') {
            window.location.href = 'dashboard.html';
            return;
        }
    }

    if (hasValidToken) {
        document.addEventListener('DOMContentLoaded', () => {
            const userName = localStorage.getItem('user-name') || 'Founder';
            const userEmail = localStorage.getItem('user-email') || '';
            const userRole = localStorage.getItem('user-role') || '';
            
            let displayRole = 'Level 4 Founder';
            const isAdmin = userEmail.includes('admin') || userRole === 'admin';
            
            if (isAdmin) {
                displayRole = 'Admin User';
            } else if (userEmail.includes('elena') || userRole === 'mentor') {
                displayRole = 'VC Advisor';
            }

            // Hide management link in the sidebar for non-admin users
            if (!isAdmin) {
                document.querySelectorAll('a[href="management.html"]').forEach(el => {
                    el.style.display = 'none';
                });
            }

            // Dynamically replace hardcoded dummy profile text
            document.querySelectorAll('*').forEach(el => {
                if (el.children.length === 0) {
                    if (el.innerText === 'Alex Rivers') {
                        el.innerText = userName;
                    }
                    if (el.innerText === 'Level 4 Founder') {
                        el.innerText = displayRole;
                    }
                }
            });

            // Update specific profile elements
            const profileNameEl = document.getElementById('profile-name');
            if (profileNameEl) profileNameEl.innerText = userName;

            const profileEmailEl = document.getElementById('profile-email');
            if (profileEmailEl) profileEmailEl.innerText = userEmail;

            // Fetch live profile data from the database to update details
            if (window.API && window.API.getProfile) {
                window.API.getProfile().then(user => {
                    if (user) {
                        localStorage.setItem('user-name', user.personalInfo.fullName);
                        localStorage.setItem('user-email', user.email);
                        localStorage.setItem('user-role', user.role);
                        
                        document.querySelectorAll('*').forEach(el => {
                            if (el.children.length === 0) {
                                if (el.innerText === 'Alex Rivers' || el.innerText === 'Founder') {
                                    el.innerText = user.personalInfo.fullName;
                                }
                            }
                        });
                        if (profileNameEl) profileNameEl.innerText = user.personalInfo.fullName;
                    }
                }).catch(err => console.log("Profile synchronization deferred:", err));
            }
        });
    }
})();
