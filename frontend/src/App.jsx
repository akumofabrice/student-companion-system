import { useEffect, useMemo, useState } from 'react';
import api from './api';
import './style.css';
import { formatDateTime, getPlanStatus } from './utils/helpers';
import DashboardPage from './components/DashboardPage';
import PlansPage from './components/PlansPage';
import GoalsPage from './components/GoalsPage';
import TimetablePage from './components/TimetablePage';
import ForumsPage from './components/ForumsPage';
import ProfilePage from './components/ProfilePage';

export default function App() {
  const [authMode, setAuthMode] = useState('login');
  const [recoveryStep, setRecoveryStep] = useState('request');
  const [resetCode, setResetCode] = useState('');
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [token, setToken] = useState(() => localStorage.getItem('token') || '');
  const [form, setForm] = useState({ username: '', email: '', password: '', phone: '', address: '' });
  const [plans, setPlans] = useState([]);
  const [goals, setGoals] = useState([]);
  const [timetable, setTimetable] = useState(null);
  const [forums, setForums] = useState([]);
  const [activeForum, setActiveForum] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [status, setStatus] = useState('Ready');
  const [courseInput, setCourseInput] = useState('');
  const [breakInput, setBreakInput] = useState('');
  const [route, setRoute] = useState(() => window.location.pathname || '/');
  const [lastNotificationKey, setLastNotificationKey] = useState('');

  const navigate = (nextRoute) => {
    if (window.location.pathname !== nextRoute) {
      window.history.pushState({}, '', nextRoute);
    }
    setRoute(nextRoute);
  };

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const loadData = async () => {
    if (!token) return;
    try {
      const [plansRes, goalsRes, timetableRes, forumsRes] = await Promise.all([
        api.get('/plans'),
        api.get('/goals'),
        api.get('/timetable'),
        api.get('/forums'),
      ]);

      setPlans(plansRes.data || []);
      setGoals(goalsRes.data || []);
      setTimetable(timetableRes.data || null);
      setForums(forumsRes.data || []);
      setStatus('Data loaded');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Could not load data');
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const switchAuthMode = (nextMode) => {
    setAuthMode(nextMode);
    setRecoveryStep('request');
    setResetCode('');
    setStatus(nextMode === 'forgot' ? 'Enter your username or email to receive a recovery code' : 'Ready');
  };

  const handleAuth = async (event) => {
    event.preventDefault();
    setStatus('Working...');
    try {
      if (authMode === 'forgot') {
        if (recoveryStep === 'request') {
          const response = await api.post('/auth/forgot-password', {
            username: form.username,
            email: form.email,
          });

          setRecoveryStep('reset');
          setStatus(response.data.message || 'Recovery code created');
          return;
        }

        const response = await api.post('/auth/reset-password', {
          username: form.username,
          email: form.email,
          resetCode,
          newPassword: form.password,
        });

        setAuthMode('login');
        setRecoveryStep('request');
        setResetCode('');
        setForm({ ...form, password: '' });
        setStatus(response.data.message || 'Password updated');
        return;
      }

      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
      const payload =
        authMode === 'login'
          ? { username: form.username, password: form.password }
          : {
              username: form.username,
              email: form.email,
              password: form.password,
              phone: form.phone,
              address: form.address,
            };

      const response = await api.post(endpoint, payload);
      const nextToken = response.data.token;

      localStorage.setItem('token', nextToken);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setToken(nextToken);
      setUser(response.data.user);
      setRoute('/');
      setStatus(authMode === 'login' ? 'Welcome back' : 'Account created');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Authentication failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
    setPlans([]);
    setGoals([]);
    setTimetable(null);
    setForums([]);
    setActiveForum(null);
    setMessages([]);
    setRoute('/');
    setStatus('Signed out');
  };

  const createPlan = async (event) => {
    event.preventDefault();
    const planDescription = event.target.planDescription.value;
    const planStart = event.target.planStart.value;
    const planEnd = event.target.planEnd.value;

    try {
      const response = await api.post('/plans', { planDescription, planStart, planEnd });
      setPlans((prev) => [response.data, ...prev]);
      event.target.reset();
      setStatus('Plan saved');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Plan could not be saved');
    }
  };

  const createGoal = async (event) => {
    event.preventDefault();
    const goalDescription = event.target.goalDescription.value;
    const goalCategory = event.target.goalCategory.value;

    try {
      const response = await api.post('/goals', { goalDescription, goalCategory });
      setGoals((prev) => [response.data, ...prev]);
      event.target.reset();
      setStatus('Goal saved');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Goal could not be saved');
    }
  };

  const generateTimetable = async (event) => {
    event.preventDefault();

    const courses = courseInput
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const breaks = breakInput
      .split(';')
      .map((entry) => entry.trim())
      .filter(Boolean)
      .map((entry) => {
        const [day, startTime, endTime] = entry.split(',');
        return { day, startTime, endTime };
      });

    try {
      const response = await api.post('/timetable/generate', { courses, breaks });
      setTimetable(response.data);
      setStatus('Timetable generated');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Timetable could not be generated');
    }
  };

  const openForum = async (forum) => {
    setActiveForum(forum);
    setMessages([]);
    try {
      const response = await api.get(`/forums/${forum.forumId}/messages`);
      setMessages(response.data || []);
    } catch (error) {
      setStatus('Could not load messages');
    }
  };

  const createForum = async (event) => {
    event.preventDefault();

    try {
      const response = await api.post('/forums', {
        forumName: event.target.forumName.value,
        forumDesc: event.target.forumDesc.value,
        forumRules: event.target.forumRules.value,
      });

      setForums((prev) => [response.data, ...prev]);
      event.target.reset();
      setStatus('Forum created');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Forum could not be created');
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    if (!activeForum || !messageText.trim()) return;

    try {
      const response = await api.post(`/forums/${activeForum.forumId}/messages`, {
        forumId: activeForum.forumId,
        messageContent: messageText,
      });

      setMessages((prev) => [...prev, response.data]);
      setMessageText('');
    } catch (error) {
      setStatus(error.response?.data?.message || 'Message could not be sent');
    }
  };

  const summary = useMemo(
    () => ({
      plans: plans.length,
      goals: goals.filter((goal) => goal.status === 'active').length,
      completedGoals: goals.filter((goal) => goal.status === 'completed').length,
    }),
    [plans, goals]
  );

  const notifications = useMemo(() => {
    const items = [];

    plans.forEach((plan) => {
      const type = getPlanStatus(plan);
      items.push({
        id: `plan-${plan.planId}`,
        title: plan.planDescription,
        message: `${formatDateTime(plan.planStart)} → ${formatDateTime(plan.planEnd)}`,
        type,
        date: plan.planStart,
      });
    });

    goals.forEach((goal) => {
      const type = goal.status === 'completed' ? 'completed' : 'pending';
      items.push({
        id: `goal-${goal.goalId}`,
        title: goal.goalDescription,
        message: `${goal.goalCategory} • ${goal.status}`,
        type,
        date: goal.updatedAt || goal.createdAt || new Date().toISOString(),
      });
    });

    return items.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [plans, goals]);

  const counts = useMemo(
    () => ({
      pending: notifications.filter((item) => item.type === 'pending').length,
      completed: notifications.filter((item) => item.type === 'completed').length,
      upcoming: notifications.filter((item) => item.type === 'upcoming').length,
    }),
    [notifications]
  );

  const requestNotifications = () => {
    if (!('Notification' in window)) {
      setStatus('This browser does not support notifications');
      return;
    }

    if (Notification.permission === 'granted') {
      setStatus('Notifications are already enabled');
      return;
    }

    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        setStatus('Notifications enabled');
      } else {
        setStatus('Notifications permission denied');
      }
    });
  };

  useEffect(() => {
    if (!('Notification' in window) || Notification.permission !== 'granted' || notifications.length === 0) {
      return;
    }

    const topItems = notifications.slice(0, 3);
    const key = topItems.map((item) => item.id).join('|');

    if (key === lastNotificationKey) return;

    topItems.forEach((item) => {
      new Notification(item.title, {
        body: `${item.type.toUpperCase()} • ${item.message}`,
      });
    });

    setLastNotificationKey(key);
  }, [notifications, lastNotificationKey]);

  if (!token || !user) {
    return (
      <div className="app-shell auth-shell">
        <div className="card auth-card">
          <h1>My School Companion</h1>
          <p>
            Plan your studies, track progress, and stay connected with your campus community.
          </p>

          <div className="toggle-row">
            <button
              type="button"
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => switchAuthMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => switchAuthMode('register')}
            >
              Register
            </button>
            <button
              type="button"
              className={authMode === 'forgot' ? 'active' : ''}
              onClick={() => switchAuthMode('forgot')}
            >
              Forgot password
            </button>
          </div>

          <form onSubmit={handleAuth} className="stack">
            <input
              placeholder={authMode === 'forgot' ? 'Username or email' : 'Username'}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />

            {authMode === 'register' && (
              <>
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
                <input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                <input
                  placeholder="Address"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </>
            )}

            {authMode === 'forgot' && recoveryStep === 'reset' && (
              <>
                <input
                  placeholder="Recovery code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="New password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </>
            )}

            {(authMode === 'login' || authMode === 'register') && (
              <input
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            )}

            <button type="submit">
              {authMode === 'login'
                ? 'Sign in'
                : authMode === 'register'
                  ? 'Create account'
                  : recoveryStep === 'request'
                    ? 'Send recovery code'
                    : 'Reset password'}
            </button>
          </form>

          <p className="status">{status}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar card">
        <div className="topbar-user-section">
          {user.photo ? (
            <img src={user.photo} alt={user.username} className="topbar-avatar" />
          ) : (
            <div className="topbar-avatar-placeholder">
              {user.username.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="eyebrow">Student Companion</p>
            <h2>Welcome back, {user.username}</h2>
          </div>
        </div>

        <div className="topbar-actions">
          <button type="button" className="ghost-btn" onClick={() => navigate('/')}>
            Dashboard
          </button>
          <button type="button" className="ghost-btn" onClick={() => navigate('/profile')}>
            Profile
          </button>
          <button type="button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="content-stack">
        {route === '/plans' ? (
          <PlansPage plans={plans} createPlan={createPlan} navigate={navigate} />
        ) : route === '/goals' ? (
          <GoalsPage goals={goals} createGoal={createGoal} navigate={navigate} />
        ) : route === '/timetable' ? (
          <TimetablePage
            courseInput={courseInput}
            setCourseInput={setCourseInput}
            breakInput={breakInput}
            setBreakInput={setBreakInput}
            timetable={timetable}
            generateTimetable={generateTimetable}
            navigate={navigate}
          />
        ) : route === '/forums' ? (
          <ForumsPage
            forums={forums}
            createForum={createForum}
            activeForum={activeForum}
            openForum={openForum}
            messages={messages}
            messageText={messageText}
            setMessageText={setMessageText}
            sendMessage={sendMessage}
            navigate={navigate}
          />
        ) : route === '/profile' ? (
          <ProfilePage
            user={user}
            setUser={setUser}
            navigate={navigate}
            setStatus={setStatus}
          />
        ) : (
          <DashboardPage
            user={user}
            summary={summary}
            notifications={notifications}
            counts={counts}
            navigate={navigate}
            requestNotifications={requestNotifications}
          />
        )}
      </main>

      <p className="status">{status}</p>
    </div>
  );
}
