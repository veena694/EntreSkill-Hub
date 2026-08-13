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
    localStorage.removeItem('onboardingCompleted');
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
                    const data = resJson.data;
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
        const payload = responseData.data;
        
        setTokens(payload.accessToken, payload.refreshToken);
        if (payload.user) {
            localStorage.setItem('user-name', payload.user.personalInfo?.fullName || '');
            localStorage.setItem('user-email', payload.user.email || '');
            localStorage.setItem('user-role', payload.user.role || '');
            localStorage.setItem('onboardingCompleted', String(payload.user.onboardingCompleted || false));
        }
        return responseData;
    },

    async getGoogleAuthUrl() {
        const res = await apiFetch('/auth/google/url');
        if (!res.ok) return null;
        const json = await res.json();
        return json.data?.url || null;
    },

    async googleLogin(email, fullName, googleId) {
        const res = await apiFetch('/auth/google', {
            method: 'POST',
            body: JSON.stringify({ email, fullName, googleId })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Google login failed');

        const responseData = await res.json();
        const payload = responseData.data;

        setTokens(payload.accessToken, payload.refreshToken);
        if (payload.user) {
            localStorage.setItem('user-name', payload.user.personalInfo?.fullName || '');
            localStorage.setItem('user-email', payload.user.email || '');
            localStorage.setItem('user-role', payload.user.role || '');
            localStorage.setItem('onboardingCompleted', String(payload.user.onboardingCompleted || false));
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
        const json = await res.json();
        return json.data || null;
    },

    async getDashboard() {
        const res = await apiFetch('/users/dashboard');
        if (!res.ok) return null;
        const json = await res.json();
        return json.data || null;
    },

    async updateProfile(profileData) {
        const res = await apiFetch('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json.data || null;
    },

    async completeOnboarding(skills, interests, budget, experience, goals) {
        const res = await apiFetch('/users/onboarding', {
            method: 'POST',
            body: JSON.stringify({ skills, interests, budget, experience, goals })
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Onboarding failed');
        const json = await res.json();
        localStorage.setItem('onboardingCompleted', 'true');
        return json.data;
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
    },

    async bookmarkIdea(ideaId) {
        const res = await apiFetch(`/users/bookmarks/${ideaId}`, { method: 'POST' });
        if (!res.ok) return null;
        return (await res.json()).data;
    },

    async removeBookmark(ideaId) {
        const res = await apiFetch(`/users/bookmarks/${ideaId}`, { method: 'DELETE' });
        if (!res.ok) return null;
        return (await res.json()).data;
    },

    async getBookmarks() {
        const res = await apiFetch('/users/bookmarks');
        if (!res.ok) return [];
        return (await res.json()).data || [];
    }
};

// Expose globally
window.API = API;

// Auth Guard and Dynamic Profile Loader
(function() {
    // Extract tokens from URL query parameters (e.g. after Google OAuth callback redirect from backend)
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('accessToken') || urlParams.get('token');
        const refreshFromUrl = urlParams.get('refreshToken');

        if (tokenFromUrl && tokenFromUrl !== 'undefined' && tokenFromUrl !== 'null') {
            setTokens(tokenFromUrl, refreshFromUrl);
            const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
            window.history.replaceState({ path: cleanUrl }, '', cleanUrl);
        }
    } catch (e) {
        console.warn('Error processing URL tokens:', e);
    }

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

    // Onboarding redirect: if logged in but onboarding incomplete, go to join.html
    if (hasValidToken && !isPublicPage) {
        const onboardingDone = localStorage.getItem('onboardingCompleted');
        if (onboardingDone !== 'true' && !window.location.pathname.endsWith('join.html')) {
            window.location.href = 'join.html';
            return;
        }
    }

    // Role-based Access Control (RBAC): Only admins can visit management.html
    if (hasValidToken && window.location.pathname.endsWith('management.html')) {
        const userRole = localStorage.getItem('user-role') || '';
        if (userRole !== 'admin') {
            window.location.href = 'dashboard.html';
            return;
        }
    }

    if (hasValidToken) {
        document.addEventListener('DOMContentLoaded', () => {
            // Load profile from API — this is the source of truth, not localStorage
            if (window.API && window.API.getProfile) {
                window.API.getProfile().then(user => {
                    if (!user) {
                        console.warn('Could not load profile from server.');
                        return;
                    }

                    const fullName = user.personalInfo?.fullName || 'User';
                    const email = user.email || '';
                    const role = user.role || '';

                    // Cache for auth-guard redirect (NOT as source of truth for display)
                    localStorage.setItem('user-name', fullName);
                    localStorage.setItem('user-email', email);
                    localStorage.setItem('user-role', role);
                    localStorage.setItem('onboardingCompleted', String(user.onboardingCompleted || false));

                    // Check onboarding status from server
                    if (!user.onboardingCompleted && !window.location.pathname.endsWith('join.html')) {
                        window.location.href = 'join.html';
                        return;
                    }

                    let displayRole = 'Founder';
                    if (role === 'admin') {
                        displayRole = 'Admin';
                    } else if (role === 'mentor') {
                        displayRole = 'Mentor';
                    }

                    // Hide management link in the sidebar for non-admin users
                    if (role !== 'admin') {
                        document.querySelectorAll('a[href="management.html"]').forEach(el => {
                            el.style.display = 'none';
                        });
                    }

                    // Update sidebar profile name elements
                    const sidebarNames = document.querySelectorAll('.sidebar-user-name, [data-user-name]');
                    sidebarNames.forEach(el => { el.innerText = fullName; });

                    const sidebarRoles = document.querySelectorAll('.sidebar-user-role, [data-user-role]');
                    sidebarRoles.forEach(el => { el.innerText = displayRole; });

                    // Update specific profile elements
                    const profileNameEl = document.getElementById('profile-name');
                    if (profileNameEl) profileNameEl.innerText = fullName;

                    const profileEmailEl = document.getElementById('profile-email');
                    if (profileEmailEl) profileEmailEl.innerText = email;

                    // Update all generic placeholder elements that show user name/role
                    document.querySelectorAll('[data-bind="user-fullname"]').forEach(el => {
                        el.innerText = fullName;
                    });
                    document.querySelectorAll('[data-bind="user-role"]').forEach(el => {
                        el.innerText = displayRole;
                    });

                }).catch(err => console.error('Profile load error:', err));
            }
        });
    }
})();
