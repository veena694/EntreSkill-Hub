// EntreSkill Hub Client API Helper
const API_BASE_URL = (typeof window !== 'undefined' && window.VITE_API_URL) 
    || 'https://entreskill-hub-qafi.onrender.com/api/v1';

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
    options.credentials = 'include';
    
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
                    credentials: 'include',
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
                    const isCompleted = Boolean(user.onboardingCompleted);

                    // Cache for auth-guard redirect (NOT as source of truth for display)
                    localStorage.setItem('user-name', fullName);
                    localStorage.setItem('user-email', email);
                    localStorage.setItem('user-role', role);
                    localStorage.setItem('onboardingCompleted', String(isCompleted));

                    const isJoinPage = window.location.pathname.endsWith('join.html');
                    const isLandingPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';

                    // If user is ALREADY completed:
                    if (isCompleted) {
                        if (isJoinPage || isLandingPage) {
                            window.location.href = 'dashboard.html';
                            return;
                        }
                    } else {
                        // User is INCOMPLETE:
                        if (!isJoinPage) {
                            window.location.href = 'join.html';
                            return;
                        } else if (typeof window.nextStep === 'function') {
                            // If on join.html, advance from step 0 (login form) to step 1 (onboarding)
                            window.nextStep(1);
                        }
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

                    // Update user avatar containers with profile photo or initials
                    const userInitial = (fullName.trim()[0] || 'U').toUpperCase();
                    document.querySelectorAll('a[href="profile.html"].rounded-full, .w-10.h-10.rounded-full').forEach(container => {
                        if (user?.personalInfo?.profilePicture) {
                            container.innerHTML = `<img class="w-full h-full object-cover" src="${user.personalInfo.profilePicture}">`;
                        } else {
                            container.innerHTML = `<span class="font-bold text-sm">${userInitial}</span>`;
                        }
                    });

                    const heroAvatarContainer = document.getElementById('profile-avatar-container');
                    if (heroAvatarContainer) {
                        if (user?.personalInfo?.profilePicture) {
                            heroAvatarContainer.innerHTML = `<img class="w-full h-full object-cover" src="${user.personalInfo.profilePicture}">`;
                        } else {
                            heroAvatarContainer.innerHTML = `<span class="font-bold text-display-lg">${userInitial}</span>`;
                        }
                    }

                    // Fetch user's dashboard metrics and bookmarks for dynamic rendering
                    Promise.all([
                        window.API.getDashboard ? window.API.getDashboard().catch(() => null) : Promise.resolve(null),
                        window.API.getBookmarks ? window.API.getBookmarks().catch(() => []) : Promise.resolve([])
                    ]).then(([dashData, bookmarks]) => {
                        bindDashboardData(user, dashData);
                        bindProfileData(user, dashData, bookmarks);
                        bindLearnData(dashData);
                    });

                }).catch(err => console.error('Profile load error:', err));
            }
        });
    }
})();

function bindDashboardData(user, dashData) {
    if (!window.location.pathname.endsWith('dashboard.html')) return;

    // Greeting
    const greetingEl = document.querySelector('main h1');
    if (greetingEl) {
        const fullName = user?.personalInfo?.fullName || 'User';
        greetingEl.innerText = `Hello, ${fullName}! Ready to grow today?`;
    }

    const roadmapSummary = dashData?.roadmapProgressSummary || [];
    const bookings = dashData?.latestBookings || [];

    // Calculate Overall Journey Progress
    let overallProgress = 0;
    if (Array.isArray(roadmapSummary) && roadmapSummary.length > 0) {
        const total = roadmapSummary.reduce((acc, curr) => acc + Math.max(0, Math.min(100, Number(curr.percentageComplete || 0))), 0);
        overallProgress = Math.round(total / roadmapSummary.length);
    }
    const safePercentage = Math.max(0, Math.min(100, Number(overallProgress || 0)));

    const progressSpan = document.querySelector('.animate-progress')?.parentElement?.nextElementSibling?.querySelector('span');
    if (progressSpan) progressSpan.innerText = `${safePercentage}%`;

    const circle = document.querySelector('circle.animate-progress');
    if (circle) {
        const radius = 90;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (safePercentage / 100) * circumference;
        circle.setAttribute('stroke-dasharray', String(Math.round(circumference)));
        circle.setAttribute('stroke-dashoffset', String(Math.round(offset)));
        circle.style.strokeDashoffset = `${Math.round(offset)}px`;
    }

    const milestoneSpan = document.querySelector('circle.animate-progress')?.parentElement?.parentElement?.querySelector('p span.font-bold');
    if (milestoneSpan) {
        milestoneSpan.innerText = roadmapSummary.length > 0 ? 'Market Validation' : 'Select your first roadmap';
    }

    // Dynamic Upcoming Sessions
    const upcomingContainer = document.querySelector('.lg\\:col-span-5 .space-y-md');
    if (upcomingContainer) {
        if (bookings.length > 0) {
            upcomingContainer.innerHTML = bookings.map(b => `
                <div class="flex gap-md items-start p-sm hover:bg-surface-container-low rounded-lg transition-all border border-transparent hover:border-outline-variant">
                    <div class="w-12 h-12 rounded-full bg-secondary-fixed flex-shrink-0 flex items-center justify-center">
                        <span class="material-symbols-outlined text-on-secondary-fixed">video_call</span>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-body-md font-bold text-on-surface">${b.topic || 'Mentor Session'}</h4>
                        <p class="text-body-sm text-on-surface-variant">${b.bookingDate || ''} at ${b.timeSlot || ''}</p>
                    </div>
                </div>
            `).join('');
        } else {
            upcomingContainer.innerHTML = `
                <div class="p-base text-center text-on-surface-variant">
                    <span class="material-symbols-outlined text-[36px] text-outline mb-xs">event_busy</span>
                    <p class="text-body-sm">No upcoming sessions. Book a mentor to get tailored advice.</p>
                </div>
            `;
        }
    }

    // Dynamic Activity
    const activityContainer = document.querySelector('.lg\\:col-span-12 .relative.space-y-md');
    if (activityContainer && roadmapSummary.length === 0 && bookings.length === 0) {
        activityContainer.innerHTML = `
            <div class="p-base text-center text-on-surface-variant">
                <span class="material-symbols-outlined text-[36px] text-outline mb-xs">history</span>
                <p class="text-body-sm">No recent activity yet. Select a roadmap to begin tracking your progress.</p>
            </div>
        `;
    }
}

function bindProfileData(user, dashData, bookmarks) {
    if (!window.location.pathname.endsWith('profile.html')) return;

    const bioEl = document.getElementById('profile-bio');
    if (bioEl) {
        bioEl.innerText = user?.personalInfo?.bio || 'No bio provided yet. Click edit to complete your profile bio.';
    }

    const locationEl = document.getElementById('profile-location');
    if (locationEl) {
        locationEl.innerText = user?.personalInfo?.location || 'Location not set';
    }

    const linkEl = document.getElementById('profile-link');
    if (linkEl) {
        if (user?.personalInfo?.website) {
            linkEl.innerText = user.personalInfo.website;
            linkEl.href = user.personalInfo.website.startsWith('http') ? user.personalInfo.website : 'https://' + user.personalInfo.website;
        } else {
            linkEl.innerText = 'Website not set';
            linkEl.href = '#';
        }
    }

    // Goals
    const goalsList = document.querySelector('.bg-secondary-container ul');
    if (goalsList) {
        const goals = user?.onboarding?.goals || user?.onboarding?.interests || [];
        if (goals.length > 0) {
            goalsList.innerHTML = goals.map(g => `
                <li class="flex items-start gap-base">
                    <span class="material-symbols-outlined text-primary">check_circle</span>
                    <span class="font-body-sm">${g}</span>
                </li>
            `).join('');
        } else {
            goalsList.innerHTML = `
                <li class="flex items-start gap-base text-on-surface-variant">
                    <span class="material-symbols-outlined text-outline">info</span>
                    <span class="font-body-sm">No business goals specified yet. Complete onboarding or edit profile.</span>
                </li>
            `;
        }
    }

    // Roadmap Progress
    const roadmapSummary = dashData?.roadmapProgressSummary || [];
    let overallProgress = 0;
    if (Array.isArray(roadmapSummary) && roadmapSummary.length > 0) {
        const total = roadmapSummary.reduce((acc, curr) => acc + Math.max(0, Math.min(100, Number(curr.percentageComplete || 0))), 0);
        overallProgress = Math.round(total / roadmapSummary.length);
    }
    const safePercentage = Math.max(0, Math.min(100, Number(overallProgress || 0)));

    const progressRing = document.querySelector('.progress-ring__circle');
    if (progressRing) {
        const radius = 40;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (safePercentage / 100) * circumference;
        progressRing.setAttribute('stroke-dasharray', String(Math.round(circumference)));
        progressRing.setAttribute('stroke-dashoffset', String(Math.round(offset)));
        progressRing.style.strokeDashoffset = `${Math.round(offset)}px`;

        const percentText = progressRing.parentElement.nextElementSibling?.querySelector('span');
        if (percentText) percentText.innerText = `${safePercentage}%`;

        const completedCount = roadmapSummary.filter(r => r.isCompleted).length;
        const summaryText = progressRing.parentElement.parentElement.nextElementSibling;
        if (summaryText) summaryText.innerText = `${completedCount} of ${roadmapSummary.length} milestones reached.`;
    }

    // Bookmarks / Saved Resources
    const bookmarksGrid = document.querySelector('section:has(#settings) ~ section') || document.querySelectorAll('section')[2]?.querySelector('.grid');
    const targetGrid = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3');
    if (targetGrid) {
        if (bookmarks && bookmarks.length > 0) {
            targetGrid.innerHTML = bookmarks.map(b => `
                <div class="bg-white rounded-lg border border-outline-variant p-md flex flex-col group hover:shadow-lg transition-shadow">
                    <div class="flex justify-between items-start mb-md">
                        <div class="w-10 h-10 bg-primary-container rounded-lg flex items-center justify-center text-on-primary-container">
                            <span class="material-symbols-outlined">analytics</span>
                        </div>
                        <span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">bookmark</span>
                    </div>
                    <h3 class="font-headline-md text-on-surface mb-xs">${b.title || 'Saved Idea'}</h3>
                    <p class="text-body-sm text-on-surface-variant">${b.description || 'Saved business idea'}</p>
                </div>
            `).join('');
        } else {
            targetGrid.innerHTML = `
                <div class="col-span-full p-lg text-center bg-white rounded-lg border border-outline-variant text-on-surface-variant">
                    <span class="material-symbols-outlined text-[40px] text-outline mb-xs">bookmark_border</span>
                    <p class="font-label-md text-on-surface mb-xs">No saved resources yet</p>
                    <p class="text-body-sm">Explore business ideas on the roadmap page and bookmark them to view here.</p>
                </div>
            `;
        }
    }

    // Credentials & Certificates
    const certs = dashData?.certificatesEarned || [];
    const certsContainer = document.querySelector('section:nth-of-type(4) .space-y-md');
    if (certsContainer) {
        if (certs.length > 0) {
            certsContainer.innerHTML = certs.map(c => `
                <div class="flex flex-col md:flex-row items-start md:items-center gap-md p-md rounded-xl hover:bg-surface-container-low transition-colors">
                    <div class="p-3 bg-tertiary-fixed-dim rounded-lg text-on-tertiary-fixed">
                        <span class="material-symbols-outlined text-headline-md">verified_user</span>
                    </div>
                    <div class="flex-grow">
                        <h4 class="font-headline-md text-on-surface">${c.title || 'Certificate'}</h4>
                        <p class="text-body-sm text-on-surface-variant">Issued ${c.issuedDate || 'Recently'} • ID: ${c.certificateId || 'ID-1001'}</p>
                    </div>
                </div>
            `).join('');
        } else {
            certsContainer.innerHTML = `
                <div class="p-base text-center text-on-surface-variant">
                    <span class="material-symbols-outlined text-[40px] text-outline mb-xs">workspace_premium</span>
                    <p class="font-label-md text-on-surface mb-xs">No credentials earned yet</p>
                    <p class="text-body-sm">Complete roadmap steps and learning modules to earn verified certificates.</p>
                </div>
            `;
        }
    }
}

function bindLearnData(dashData) {
    if (!window.location.pathname.endsWith('learn.html')) return;

    const container = document.querySelector('.scroll-mask');
    if (container) {
        const learning = dashData?.learningProgress || [];
        if (learning.length === 0) {
            container.innerHTML = `
                <div class="w-full p-lg bg-surface-container-lowest rounded-[24px] border border-outline-variant text-center text-on-surface-variant">
                    <span class="material-symbols-outlined text-[40px] text-primary mb-xs">school</span>
                    <h3 class="font-headline-md text-on-surface mb-xs">Start Your First Course</h3>
                    <p class="text-body-sm">Explore featured courses below to build your founder skillsets.</p>
                </div>
            `;
        }
    }
}
